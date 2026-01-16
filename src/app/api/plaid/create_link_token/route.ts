import { plaidClient } from "@/lib/plaid";
import { CountryCode, Products } from "plaid";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // In a real app, you would get the user ID from the session/auth
    const clientUserId = "user_" + Math.random().toString(36).substring(7);

    const createTokenResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: clientUserId,
      },
      client_name: "Funding Match",
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Gb], // Adjust based on your region (e.g., US, CA, GB)
      language: "en",
    });

    return NextResponse.json(createTokenResponse.data);
  } catch (error) {
    console.error("Error creating link token:", error);
    return NextResponse.json(
      { error: "Failed to create link token" },
      { status: 500 }
    );
  }
}
