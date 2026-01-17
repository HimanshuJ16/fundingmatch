import { plaidClient } from "@/lib/plaid";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { AuthGetRequest } from "plaid";

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

    // 2. Fetch accounts from Plaid
    const request: AuthGetRequest = {
      access_token: connection.accessToken,
    };

    const response = await plaidClient.authGet(request);

    // 3. Return account data
    return NextResponse.json({
      accounts: response.data.accounts,
      numbers: response.data.numbers,
    });
  } catch (error) {
    console.error("Error fetching Plaid accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}
