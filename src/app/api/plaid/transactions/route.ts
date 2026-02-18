import { NextResponse } from "next/server";
import { analyzePlaidConnection } from "@/lib/plaid-analysis";

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

    const { data, accounts } = await analyzePlaidConnection(connection_id);

    return NextResponse.json({
      success: true,
      data,
      accounts
    });

  } catch (error: any) {
    console.error("Error fetching Plaid transactions:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch transactions" }, { status: 500 });
  }
}
