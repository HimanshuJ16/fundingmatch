import { NextResponse } from "next/server";
import { matchLenders, ApplicationData } from "@/lib/lender-rules";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate or reconstruct ApplicationData from the request body
    // The body might contain separate objects for 'formData', 'bankAnalysis', 'experianData'
    // We map them to our schema.

    // Safe extraction with defaults
    const formData = body.formData || {};
    const bankAnalysis = body.bankAnalysis || {};
    const experianData = body.experianData || {};

    const applicationData: ApplicationData = {
      company: {
        type: formData.businessType || "limited_company",
        timeTradingMonths: parseInt(formData.timeTrading) || 0, // Frontend should send numeric or we parse string "12 months"
        hasFiledAccounts: experianData.company?.summary?.companyStatus === "Active", // Simplification based on Status
        insolvencyEvents: (experianData.company?.summary?.legalNotices?.count > 0 || experianData.company?.summary?.insolvency?.count > 0),
        iva: false, // Not directly in company data, usually personal. Default false.
      },
      credit: {
        experianScore: experianData.director?.summary?.personalCreditScore || 0, // Verified Personal Score (e.g. 837)
        experianDelphiScore: experianData.company?.summary?.commercialDelphiScore || 0, // Verified Commercial Score (e.g. 85)
        experianBand: experianData.company?.summary?.commercialBand, // Verified Band (e.g. "Minimal Risk")
      },
      financials: {
        averageMonthlyTurnover: bankAnalysis.average_monthly_income || 0,
        averageMonthlyCardTurnover: bankAnalysis.average_monthly_card_turnover || 0,
        averageEodBalance: bankAnalysis.average_eod_balance || 0,
        lowBalanceDays: bankAnalysis.low_balance_days_count || 0,
        negativeBalanceDays: bankAnalysis.negative_balance_days_count || 0,
        existingLenderCount: bankAnalysis.detected_repayments?.lenders?.length || 0, // Use unique lender count, not transaction count
        detectedCardProviders: bankAnalysis.detected_card_providers || [],
      }
    };

    // If timeTrading comes as "2 years", parse it
    if (typeof formData.timeTrading === 'string') {
      const match = formData.timeTrading.match(/(\d+)/);
      if (match) {
        // Check unit
        if (formData.timeTrading.toLowerCase().includes('year')) {
          applicationData.company.timeTradingMonths = parseInt(match[1]) * 12;
        } else {
          applicationData.company.timeTradingMonths = parseInt(match[1]);
        }
      }
    }

    console.log("Matching lenders for data:", JSON.stringify(applicationData, null, 2));

    const results = matchLenders(applicationData);

    // Filter only matched lenders? Or return all with status?
    // Let's return all so UI can show "Preferred" vs "Refused" if needed, 
    // or just filter for now as "Matched".
    const matched = results.filter(r => r.match);
    const unmatched = results.filter(r => !r.match);

    console.log("Matched lenders:", matched);
    console.log("Unmatched lenders:", unmatched);

    return NextResponse.json({
      success: true,
      matches: matched,
      unmatched: unmatched, // useful for debugging or "Why didn't I match?"
    });

  } catch (error: any) {
    console.error("Error matching lenders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to match lenders" },
      { status: 500 }
    );
  }
}
