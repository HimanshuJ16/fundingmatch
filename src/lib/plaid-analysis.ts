import { plaidClient } from "@/lib/plaid";
import { prisma } from "@/lib/prisma";
import { TransactionsGetRequest } from "plaid";

export interface PlaidAnalysisResult {
  data: any; // Aggregated data
  accounts: any[]; // Account-level analysis
}

export async function analyzePlaidConnection(connectionId: string): Promise<PlaidAnalysisResult> {
  // 1. Retrieve access token from DB
  const connection = await prisma.plaidConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new Error("Connection not found");
  }

  // 2. Calculate date range for 2 years (730 days)
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 730);
  const startDateStr = startDate.toISOString().split("T")[0];

  // 3. Fetch transactions from Plaid with Pagination
  let allTransactions: any[] = [];
  let offset = 0;
  const count = 500; // Fetch max allowed per page to be efficient
  let keepFetching = true;

  // IMPORTANT: Loop through pages until all transactions are retrieved
  while (keepFetching) {
    const request: TransactionsGetRequest = {
      access_token: connection.accessToken,
      start_date: startDateStr,
      end_date: endDate,
      options: {
        count: count,
        offset: offset,
      },
    };

    try {
      const response = await plaidClient.transactionsGet(request);
      const { transactions, total_transactions } = response.data;

      allTransactions = [...allTransactions, ...transactions];

      // Stop if we have fetched everything or if no more data is returned
      if (allTransactions.length >= total_transactions || transactions.length === 0) {
        keepFetching = false;
      } else {
        offset += count;
      }
    } catch (error) {
      console.error("Error fetching Plaid transactions page:", error);
      throw error;
    }
  }

  // Refresh accounts to ensure we have the most current balances for analysis
  const accountsRes = await plaidClient.accountsGet({
    access_token: connection.accessToken
  });
  const accounts = accountsRes.data.accounts;

  // Use the complete transaction list for analysis
  const transactions = allTransactions;

  // 4. Process Data for AI Analysis
  const accountAnalysis = accounts.map((account) => {
    const accountTransactions = transactions.filter(
      (t) => t.account_id === account.account_id
    );

    // --- 1. Monthly Income Calculation ---
    const inflows = accountTransactions
      .filter((t) => t.amount < 0)
      .map((t) => ({
        date: t.date,
        name: t.name,
        amount: Math.abs(t.amount),
        category: t.category,
      }));

    const monthlyIncome: { [key: string]: number } = {};
    inflows.forEach((inflow) => {
      const monthYear = inflow.date.substring(0, 7);
      monthlyIncome[monthYear] = (monthlyIncome[monthYear] || 0) + inflow.amount;
    });

    const incomeMonths = Object.keys(monthlyIncome).length;
    const totalIncome = Object.values(monthlyIncome).reduce((sum, val) => sum + val, 0);
    const averageMonthlyIncome = incomeMonths > 0 ? totalIncome / incomeMonths : 0;

    // --- 2. Lender Repayment Detection ---
    const genericRepaymentTerms = [
      "loan", "repayment", "instalment", "installment", "instlmnt", "emi",
      "credit", "finance", "financing", "lending", "capital", "advance",
      "agreement", "settlement", "debt", "borrow"
    ];

    const knownLenders = [
      "iwoca", "funding circle", "youlend", "libis", "fleximize", "esme loans",
      "marketfinance", "thincats", "capify", "worldpay advance", "tide cashflow",
      "nucleus commercial finance", "boost capital", "just cashflow", "365 finance",
      "lombard", "bibby", "white oak", "ultimate finance", "shawbrook", "allica",
      "close brothers", "paragon", "metro bank business loan", "hsbc business loan",
      "barclays business loan", "lloyds business loan", "natwest business loan",
      "santander business loan", "zopa", "ratesetter", "amigo", "klarna", "clearpay"
    ];

    const outflows = accountTransactions
      .filter((t) => t.amount > 0)
      .map((t) => ({
        date: t.date,
        name: t.name,
        amount: t.amount,
        category: t.category,
      }));

    const detectedRepayments = outflows.filter((t) => {
      const nameLower = t.name.toLowerCase().trim();
      const isSpecific = knownLenders.some(k => nameLower.includes(k));
      const isGeneric = genericRepaymentTerms.some(k => nameLower.includes(k));
      return isSpecific || isGeneric;
    });

    const totalRepayments = detectedRepayments.reduce((sum, t) => sum + t.amount, 0);

    // --- 3. Average End of Day Balance ---
    let runningBalance = account.balances.current || 0;
    const daysToAnalyze = 730;
    const balancesList: { date: string; balance: number }[] = [];

    const txnsByDate: { [date: string]: any[] } = {};
    accountTransactions.forEach(t => {
      if (!txnsByDate[t.date]) txnsByDate[t.date] = [];
      txnsByDate[t.date].push(t);
    });

    let currentReconstructedBalance = runningBalance;
    for (let i = 0; i < daysToAnalyze; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      balancesList.push({ date: dateStr, balance: currentReconstructedBalance });

      if (txnsByDate[dateStr]) {
        const dailyNetChange = txnsByDate[dateStr].reduce((sum, t) => sum + t.amount, 0);
        currentReconstructedBalance += dailyNetChange;
      }
    }

    const averageEODBalance = balancesList.length > 0
      ? balancesList.reduce((a, b) => a + b.balance, 0) / balancesList.length
      : 0;

    // --- 4. Card Turnover & Providers ---
    const cardProviderKeywords = ["worldpay", "stripe", "paypal", "sumup", "square", "zettle"];
    const cardTransactions = inflows.filter(t => {
      const nameLower = t.name.toLowerCase();
      return cardProviderKeywords.some(k => nameLower.includes(k));
    });

    const totalCardTurnover = cardTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageMonthlyCardTurnover = incomeMonths > 0 ? totalCardTurnover / incomeMonths : 0;

    return {
      account_id: account.account_id,
      name: account.name,
      mask: account.mask,
      balances: account.balances,
      analysis: {
        total_inflow: inflows.reduce((sum, t) => sum + t.amount, 0),
        total_outflow: outflows.reduce((sum, t) => sum + t.amount, 0),
        transaction_count: accountTransactions.length,
        average_monthly_income: averageMonthlyIncome,
        detected_repayments: {
          count: detectedRepayments.length,
          total_amount: totalRepayments,
          lenders: Array.from(new Set(detectedRepayments.map(t => t.name))),
          transactions: detectedRepayments
        },
        average_monthly_card_turnover: averageMonthlyCardTurnover,
        average_eod_balance: averageEODBalance,
        low_balance_days_count: balancesList.filter(b => b.balance < 300).length,
        negative_balance_days_count: balancesList.filter(b => b.balance < 0).length,
        inflows,
        outflows,
      },
    };
  });

  // 5. Aggregation
  const aggregatedData = {
    average_monthly_income: accountAnalysis.reduce((sum, res) => sum + res.analysis.average_monthly_income, 0) / (accountAnalysis.length || 1),
    average_eod_balance: accountAnalysis.reduce((sum, res) => sum + res.analysis.average_eod_balance, 0) / (accountAnalysis.length || 1),
    detected_repayments: {
      count: accountAnalysis.reduce((sum, res) => sum + res.analysis.detected_repayments.count, 0),
      total_amount: accountAnalysis.reduce((sum, res) => sum + res.analysis.detected_repayments.total_amount, 0),
      lenders: Array.from(new Set(accountAnalysis.flatMap(res => res.analysis.detected_repayments.lenders)))
    },
    currency_code: accounts[0]?.balances?.iso_currency_code || "GBP"
  };

  return {
    data: aggregatedData,
    accounts: accountAnalysis
  };
}
