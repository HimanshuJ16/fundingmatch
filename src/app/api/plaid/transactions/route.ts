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
      const repaymentKeywords = ["loan", "capital", "finance", "iwoca", "funding circle", "youlend", "libis", "credit", "amigo"];
      // Add more specific UK lender names as needed

      const outflows = accountTransactions
        .filter((t) => t.amount > 0)
        .map((t) => ({
          date: t.date,
          name: t.name,
          amount: t.amount,
          category: t.category,
        }));

      const detectedRepayments = outflows.filter((t) => {
        const nameLower = t.name.toLowerCase();
        return repaymentKeywords.some((keyword) => nameLower.includes(keyword));
      });

      const totalRepayments = detectedRepayments.reduce((sum, t) => sum + t.amount, 0);


      // --- 3. Average End of Day Balance ---
      // Reconstruct daily balances from the current available balance backwards
      // This is an estimation. Plaid does provide historical balances via `/accounts/balance/get` but it's checking usage. 
      // Reconstructing from transactions is a standard lightweight approach for estimation.

      let runningBalance = account.balances.current || 0;
      const dailyBalances: number[] = [];

      // Sort transactions by date descending (newest first) - typically Plaid returns them this way but ensure it.
      const sortedTransactions = [...accountTransactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // We need to group transactions by day to adjust the running balance correctly EOD
      // But for a simple average over the period, we can just iterate.
      // To be more precise for "EOD", we should adjust rule: 
      // Balance_Prev_Day = Balance_Today - (Today_Inflows - Today_Outflows) 
      // = Balance_Today - (Today_Net_Change)
      // Since Plaid amounts: + is outflow, - is inflow.
      // Net_Change in Plaid terms = Sum(Amounts)
      // Balance_Prev = Balance_Curr - Sum(Amounts_Day) ?? No.
      // Balance_Before_Transaction = Balance_After + Transaction_Amount (Plaid Amount)
      // Ex: Balance 100. Spent 10 (Plaid +10). Balance was 110. 100 + 10 = 110. Correct.
      // Ex: Balance 100. Received 50 (Plaid -50). Balance was 50. 100 + (-50) = 50. Correct.

      // So to go backwards: Balance_Prev = Balance_Curr + Transaction_Amount

      const uniqueDays = Array.from(new Set(sortedTransactions.map(t => t.date))).sort().reverse();

      // We will map "Day" -> "EOD Balance"
      // Start with current balance as "today's" EOD (approximation) or the latest known.

      // Actually, let's just do a simple average of the reconstructed balances for every transaction point? 
      // No, "Usual End of Day" implies a time-weighted average or just average of daily closing balances.

      // Let's compute approx daily balances for the covered range.
      let currentReconstructedBalance = runningBalance;

      // Map of Date -> Transactions[]
      const txnsByDate: { [date: string]: typeof sortedTransactions } = {};
      sortedTransactions.forEach(t => {
        if (!txnsByDate[t.date]) txnsByDate[t.date] = [];
        txnsByDate[t.date].push(t);
      });

      // If we looked back 180 days
      const daysToAnalyze = 180;
      const balancesList: number[] = [];

      for (let i = 0; i < daysToAnalyze; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // The balance at the END of 'dateStr'.
        // If i=0 (today), it's current balance.
        // If i=1 (yesterday), it's Current + Sum(Today's Txns).

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
            transactions: detectedRepayments
          },
          average_eod_balance: averageEODBalance,
          inflows,
          outflows,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: accountAnalysis,
    });
  } catch (error) {
    console.error("Error fetching Plaid transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
