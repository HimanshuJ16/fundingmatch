
import { NextResponse } from "next/server";
import { z } from "zod";

const creditCheckSchema = z.object({
  consentCreditCheck: z.boolean().refine((val) => val === true),
  // Add other fields if needed for the check
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = creditCheckSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.issues },
        { status: 400 }
      );
    }

    // Mock Experian API call
    // In a real scenario, we would send company data to Experian here.
    // For now, we simulate a delay and return success.

    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulated response with director score and company details
    const mockResponse = {
      status: "success",
      data: {
        directorScore: 999,
        companyCreditDetails: {
          ccjs: 0,
          creditScore: 85,
          creditLimit: 50000,
        },
      },
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error("Credit check API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
