import { plaidClient } from "@/lib/plaid";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { TransactionsGetRequest } from "plaid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { connection_id } = body;

    if (!connection_id) {
      return NextResponse.json(
        { error: "Missing connection_id" },
        { status: 400 }
      );
    }

    // 1. Retrieve access token from DB
    const connection = await prisma.plaidConnection.findUnique({
      where: { id: connection_id },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // 2. Calculate date range (last 180 days)
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 180);
    const startDateStr = startDate.toISOString().split("T")[0];

    // 3. Fetch transactions from Plaid
    const request: TransactionsGetRequest = {
      access_token: connection.accessToken,
      start_date: startDateStr,
      end_date: endDate,
    };

    const response = await plaidClient.transactionsGet(request);
    const transactions = response.data.transactions;
    const accounts = response.data.accounts;

    // 4. Process Data for AI Analysis
    // Plaid convention: positive amount = money out (debit), negative amount = money in (credit)

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
        const monthYear = inflow.date.substring(0, 7); // "YYYY-MM"
        monthlyIncome[monthYear] = (monthlyIncome[monthYear] || 0) + inflow.amount;
      });

      // Calculate average monthly income
      const incomeMonths = Object.keys(monthlyIncome).length;
      const totalIncome = Object.values(monthlyIncome).reduce((sum, val) => sum + val, 0);
      const averageMonthlyIncome = incomeMonths > 0 ? totalIncome / incomeMonths : 0;


      // --- 2. Lender Repayment Detection ---
      // --- 2. Lender Repayment Detection ---
      const genericRepaymentTerms = [
        "loan", "repayment", "instalment", "installment", "instlmnt", "emi",
        "credit", "finance", "financing", "lending", "capital", "advance",
        "agreement", "settlement", "debt", "borrow"
      ];

      const knownLenders = [
        // UK business lenders / MCA
        "iwoca", "funding circle", "youlend", "libis", "fleximize", "esme loans",
        "marketfinance", "thincats", "capify", "worldpay advance", "tide cashflow",
        "nucleus commercial finance", "boost capital", "just cashflow", "365 finance",
        "lombard", "bibby", "white oak", "ultimate finance", "shawbrook", "allica",
        "close brothers", "paragon", "metro bank business loan", "hsbc business loan",
        "barclays business loan", "lloyds business loan", "natwest business loan",
        "santander business loan",

        // Personal lenders / High Street
        "zopa", "ratesetter", "rate setter", "amigo", "koyo", "118 118 money",
        "oakbrook", "drafty", "lending stream", "sunny", "satsuma", "peachy",
        "everyday loans", "novuna", "creation finance", "mbna",
        "tesco bank loan", "virgin money loan", "halifax loan", "bank of scotland loan",

        // BNPL / short-term
        "klarna", "clearpay", "laybuy", "paypal credit", "paypal pay in 3",
        "monzo flex", "barclaycard", "capital one", "aqua card", "vanquis",
        "newday", "marbles", "fluid card", "quickquid", "wonga", "cashfloat",
        "myjar", "safety net credit",

        // Asset/Auto
        "black horse", "hitachi capital", "close motor", "alphera",
        "lex autolease", "arval", "vw finance", "bmw finance", "mercedes finance"
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
        // Match specific OR generic to count the volume/transactions
        const isSpecific = knownLenders.some(k => nameLower.includes(k));
        const isGeneric = genericRepaymentTerms.some(k => nameLower.includes(k));
        return isSpecific || isGeneric;
      });

      const totalRepayments = detectedRepayments.reduce(
        (sum, t) => sum + t.amount,
        0
      );

      // --- 3. Average End of Day Balance ---
      // Reconstruct daily balances from the current available balance backwards

      let runningBalance = account.balances.current || 0;
      const dailyBalances: number[] = [];

      // Sort transactions by date descending (newest first)
      const sortedTransactions = [...accountTransactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Map of Date -> Transactions[]
      const txnsByDate: { [date: string]: typeof sortedTransactions } = {};
      sortedTransactions.forEach(t => {
        if (!txnsByDate[t.date]) txnsByDate[t.date] = [];
        txnsByDate[t.date].push(t);
      });

      // If we looked back 180 days
      const daysToAnalyze = 180;
      const balancesList: number[] = [];
      let currentReconstructedBalance = runningBalance;

      for (let i = 0; i < daysToAnalyze; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        balancesList.push(currentReconstructedBalance);

        // Prepare for the next day backwards (i.e. finding start of day balance for this day, which is end of day for prev day)
        if (txnsByDate[dateStr]) {
          const daysTxns = txnsByDate[dateStr];
          const dailyNetChange = daysTxns.reduce((sum, t) => sum + t.amount, 0);
          currentReconstructedBalance += dailyNetChange;
        }
      }

      const averageEODBalance = balancesList.length > 0
        ? balancesList.reduce((a, b) => a + b, 0) / balancesList.length
        : 0;

      // --- 4. Card Turnover & Providers ---
      const cardProviderKeywords = [
        "world pay", "worldpay", "wpy", "vantiv",
        "barclaycard", "bcl card serv",
        "elavon", "elavon fin serv",
        "global payments", "gpuk",
        "first data", "fdms", "fis",
        "dojo",
        "teya", "teya payments", "teya settlement",
        "sumup",
        "square", "squareup",
        "izettle", "zettle",
        "viva wallet",
        "lloyds cardnet", "cardnet",
        "bos cardnet",
        "aib ms", "aib merchant services",
        "paymentsense", "handepay", "takepayments", "evo payments", "tsys",
        "stripe", "paypal", "adyen", "checkout.com"
      ];

      const cardTransactions = inflows.filter(t => {
        const nameLower = t.name.toLowerCase();
        return cardProviderKeywords.some(k => nameLower.includes(k));
      });

      const totalCardTurnover = cardTransactions.reduce((sum, t) => sum + t.amount, 0);
      const averageMonthlyCardTurnover = incomeMonths > 0 ? totalCardTurnover / incomeMonths : 0;

      const detectedCardProviders = Array.from(new Set(cardTransactions.map(t => {
        const nameLower = t.name.toLowerCase();
        const matchedKeyword = cardProviderKeywords.find(k => nameLower.includes(k));
        return matchedKeyword ? matchedKeyword.toUpperCase() : t.name;
      })));

      // --- 5. Balance Checks ---
      const lowBalanceDays = balancesList.filter(b => b < 300).length;
      const negativeBalanceDays = balancesList.filter(b => b < 0).length;

      return {
        account_id: account.account_id,
        name: account.name,
        mask: account.mask,
        balances: {
          available: account.balances.available,
          current: account.balances.current,
          limit: account.balances.limit,
          iso_currency_code: account.balances.iso_currency_code,
        },
        analysis: {
          total_inflow: inflows.reduce((sum, t) => sum + t.amount, 0),
          total_outflow: outflows.reduce((sum, t) => sum + t.amount, 0),
          transaction_count: accountTransactions.length,
          average_monthly_income: averageMonthlyIncome,
          detected_repayments: {
            count: detectedRepayments.length,
            total_amount: totalRepayments,
            lenders: Array.from(new Set(detectedRepayments.map(t => {
              const nameLower = t.name.toLowerCase();
              // Prioritize Specific Lender Name
              const matchedLender = knownLenders.find(k => nameLower.includes(k));
              if (matchedLender) {
                return matchedLender.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
              }
              // If only matches generic, DO NOT add "Loan" to the lender LIST.
              return null;
            }).filter(Boolean) as string[])),
            transactions: detectedRepayments
          },
          detected_card_providers: detectedCardProviders,
          average_monthly_card_turnover: averageMonthlyCardTurnover,
          average_eod_balance: averageEODBalance,
          low_balance_days_count: lowBalanceDays,
          negative_balance_days_count: negativeBalanceDays,
          inflows,
          outflows,
        },
      };
    });

    // --- 6. Aggregation for Match Engine ---
    const aggregatedData = {
      _thought_process: "Aggregated from Plaid accounts",
      average_monthly_income: 0,
      average_eod_balance: 0,
      detected_repayments: {
        count: 0,
        total_amount: 0,
        lenders: [] as string[]
      },
      low_balance_days_count: 0,
      negative_balance_days_count: 0,
      average_monthly_card_turnover: 0,
      detected_card_providers: [] as string[],
      currency_code: accountAnalysis[0]?.balances?.iso_currency_code || "GBP"
    };

    let totalIncomeSum = 0;
    let totalEodSum = 0;
    let totalRepaymentCount = 0;
    let totalRepaymentAmount = 0;
    let totalLowBalanceDays = 0;
    let totalNegativeBalanceDays = 0;
    let totalCardTurnoverSum = 0;
    const allLenders = new Set<string>();
    const allCardProviders = new Set<string>();

    accountAnalysis.forEach((res) => {
      totalIncomeSum += (res.analysis.average_monthly_income || 0);
      totalEodSum += (res.analysis.average_eod_balance || 0);
      totalLowBalanceDays += (res.analysis.low_balance_days_count || 0);
      totalNegativeBalanceDays += (res.analysis.negative_balance_days_count || 0);
      totalCardTurnoverSum += (res.analysis.average_monthly_card_turnover || 0);

      const repayments = res.analysis.detected_repayments;
      totalRepaymentCount += (repayments.count || 0);
      totalRepaymentAmount += (repayments.total_amount || 0);

      if (Array.isArray(repayments.lenders)) {
        repayments.lenders.forEach((l: string) => allLenders.add(l));
      }

      if (Array.isArray(res.analysis.detected_card_providers)) {
        res.analysis.detected_card_providers.forEach((p: string) => allCardProviders.add(p));
      }
    });

    const count = accountAnalysis.length || 1;

    // Averages/Sums
    aggregatedData.average_monthly_income = totalIncomeSum; // Sum of incomes across accounts is usually correct for total business income? Or average? 
    // Let's stick to SUM for income (if multiple accounts)
    // Actually, analyze-statement logic aggregated by averaging file results. 
    // If files are "Month 1, Month 2" -> Average makes sense.
    // If files are "Account A, Account B" -> Sum makes sense.
    // Plaid returns Accounts. So SUM is likely better for Income.
    // But let's look at `average_eod_balance`. Sum of balances = Total Liquidity.
    // Let's use SUM for Income, and SUM for EOD Balance (Total Cash)? 
    // Wait, match-lenders expects "Average Monthly Turnover". That is definitely SUM of all accounts' turnover.
    // "Average EOD Balance" -> Total Cash Position -> Sum of all accounts.

    // Correction: analyze-statement averaged them. 
    // "totalIncomeSum / count".
    // I will stick to what analyze-statement did to ensure consistency with existing rules.
    // (Even if Sum might be more logical for multi-account, the rules might be calibrated for 'per account' or 'average view').
    // Actually, let's use Sum for Income/Turnover, Average for Balance?
    // No, analyze-statement used: aggregatedData.average_monthly_income = totalIncomeSum / count;
    // I will replicate that EXACTLY to avoid breaking rules.

    aggregatedData.average_monthly_income = totalIncomeSum / count;
    aggregatedData.average_eod_balance = totalEodSum / count;
    aggregatedData.average_monthly_card_turnover = totalCardTurnoverSum / count;

    aggregatedData.detected_repayments.count = totalRepaymentCount;
    aggregatedData.detected_repayments.total_amount = totalRepaymentAmount;
    aggregatedData.detected_repayments.lenders = Array.from(allLenders);

    aggregatedData.low_balance_days_count = totalLowBalanceDays;
    aggregatedData.negative_balance_days_count = totalNegativeBalanceDays;
    aggregatedData.detected_card_providers = Array.from(allCardProviders);

    return NextResponse.json({
      success: true,
      data: aggregatedData, // For the Form/Engine (Object)
      accounts: accountAnalysis // For the UI (Array)
    });
  } catch (error) {
    console.error("Error fetching Plaid transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
