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

      const inflows = accountTransactions
        .filter((t) => t.amount < 0)
        .map((t) => ({
          date: t.date,
          name: t.name,
          amount: Math.abs(t.amount), // Convert to positive for easier reading
          category: t.category,
        }));

      const outflows = accountTransactions
        .filter((t) => t.amount > 0)
        .map((t) => ({
          date: t.date,
          name: t.name,
          amount: t.amount,
          category: t.category,
        }));

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
