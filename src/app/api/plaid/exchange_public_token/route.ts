import { plaidClient } from "@/lib/plaid";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { public_token } = body;

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Save to database
    const plaidConnection = await prisma.plaidConnection.create({
      data: {
        accessToken,
        itemId,
      },
    });

    return NextResponse.json({
      public_token_exchange: "complete",
      connection_id: plaidConnection.id,
      item_id: itemId
    });
  } catch (error) {
    console.error("Error exchanging public token:", error);
    return NextResponse.json(
      { error: "Failed to exchange token" },
      { status: 500 }
    );
  }
}
