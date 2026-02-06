import { NextResponse } from "next/server";
import { matchLenders, ApplicationData } from "@/lib/lender-rules";
import { prisma } from "@/lib/prisma"; // Import Prisma client
import { sendEmail } from "@/lib/email";
import { generateQuickMatchEmailHtml } from "@/lib/email-templates/quick-match-admin";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let body: any = {};
    let emailAttachments: any[] = [];

    // Import helper
    const { generatePlaidReport } = await import("@/lib/plaid-report");

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const jsonString = formData.get("jsonPayload") as string;
      body = JSON.parse(jsonString || "{}");

      const files = formData.getAll("files");
      for (const file of files) {
        if (file instanceof File) {
          const buffer = Buffer.from(await file.arrayBuffer());
          emailAttachments.push({
            filename: file.name,
            content: buffer,
            contentType: file.type || "application/pdf"
          });
        }
      }
    } else {
      body = await req.json();
    }

    // Safe extraction with defaults
    const formData = body.formData || {};
    const bankAnalysis = body.bankAnalysis || {};
    const experianData = body.experianData || {};
    const plaidConnectionId = body.plaidConnectionId;

    const applicationData: ApplicationData = {
      company: {
        type: formData.businessType || "limited_company",
        timeTradingMonths: parseInt(formData.timeTrading) || 0,
        hasFiledAccounts: experianData.company?.summary?.companyStatus === "Active",
        insolvencyEvents: (experianData.company?.summary?.legalNotices?.count > 0 || experianData.company?.summary?.insolvency?.count > 0),
        iva: false,
      },
      credit: {
        experianScore: experianData.director?.summary?.personalCreditScore || 0,
        experianDelphiScore: experianData.company?.summary?.commercialDelphiScore || 0,
        experianBand: experianData.company?.summary?.commercialBand,
      },
      financials: {
        averageMonthlyTurnover: bankAnalysis.average_monthly_income || 0,
        averageMonthlyCardTurnover: bankAnalysis.average_monthly_card_turnover || 0,
        averageEodBalance: bankAnalysis.average_eod_balance || 0,
        lowBalanceDays: bankAnalysis.low_balance_days_count || 0,
        maxMonthlyLowBalanceDays: bankAnalysis.max_monthly_low_balance_occurrence || 0,
        negativeBalanceDays: bankAnalysis.negative_balance_days_count || 0,
        existingLenderCount: bankAnalysis.detected_repayments?.lenders?.length || 0,
        detectedCardProviders: bankAnalysis.detected_card_providers || [],
      }
    };

    // If timeTrading comes as "2 years", parse it
    if (typeof formData.timeTrading === 'string') {
      const match = formData.timeTrading.match(/(\d+)/);
      if (match) {
        if (formData.timeTrading.toLowerCase().includes('year')) {
          applicationData.company.timeTradingMonths = parseInt(match[1]) * 12;
        } else {
          applicationData.company.timeTradingMonths = parseInt(match[1]);
        }
      }
    }

    console.log("Matching lenders for application data...");
    const results = matchLenders(applicationData);
    const matched = results.filter(r => r.match);
    const unmatched = results.filter(r => !r.match);

    // --- SAVE TO DATABASE ---
    console.log("Saving application to database...");

    // Prepare Director Data
    let directorFirstName = "Director";
    let directorLastName = "User";

    if (formData.businessType === "sole_trader") {
      directorFirstName = formData.firstName || "Director";
      directorLastName = formData.lastName || "User";
    } else if (formData.directorName) {
      // Basic split for "John Doe"
      const parts = formData.directorName.split(' ');
      directorFirstName = parts[0];
      directorLastName = parts.slice(1).join(' ') || "";
    }

    // Determine Company Name
    const determinedCompanyName =
      (formData.businessType === "sole_trader" ? formData.tradingName : formData.companyName) ||
      experianData.company?.summary?.companyName ||
      "Unknown";

    // Create the application record
    const application = await prisma.quickMatchApplication.create({
      data: {
        businessType: formData.businessType || "limited_company",

        // Limited Company Fields
        companyName: determinedCompanyName,
        companyNumber: formData.companyRegistrationNumber || experianData.company?.summary?.registrationNumber,
        registeredAddress: formData.registeredAddress || experianData.company?.summary?.registeredAddress || "",

        // Sole Trader Fields (if applicable)
        timeTrading: String(applicationData.company.timeTradingMonths),

        // Contact
        email: formData.email,
        mobileNumber: formData.mobileNumber,

        fundingAmount: formData.fundingAmount
          ? parseFloat(String(formData.fundingAmount).replace(/[^0-9.]/g, '') || "0")
          : 0,

        creditCheckConsent: true, // Implied by reaching this step
        experianCompanyData: experianData.company?.summary || {},

        bankStatementAnalysis: bankAnalysis,

        status: matched.length > 0 ? "MATCHED" : "REJECTED",
        matchedLenders: matched as any,

        plaidConnectionId: plaidConnectionId || undefined,

        // Create Director
        directors: {
          create: {
            firstName: directorFirstName,
            lastName: directorLastName,
            residentialAddress: formData.residentialAddress || "", // Capture address
            dob: formData.directorDateOfBirth ? new Date(formData.directorDateOfBirth) : new Date(),
            homeowner: formData.homeOwnerStatus || false,
            experianData: experianData.director?.summary || {},
          }
        }
      }
    });

    console.log("Application saved with ID:", application.id);

    // --- SEND ADMIN EMAIL ---
    let emailSent = false;
    try {
      let shouldSendEmailNow = true;

      // Generate Plaid Report if connected
      // WEBHOOK-ONLY STRATEGY: 
      // If Plaid Connected, we strictly defer the email to the Webhook.
      // This ensures we always get the full 24-month history and avoids race conditions.
      if (plaidConnectionId) {
        console.log("Plaid Connection Detected. Deferring entire email to Webhook to ensure 24-month report.");
        shouldSendEmailNow = false;
      }

      if (shouldSendEmailNow) {
        const emailHtml = generateQuickMatchEmailHtml({
          formData: formData,
          applicationData: applicationData,
          bankAnalysis: bankAnalysis,
          matchedLenders: results
        });

        // Send email to admin
        const adminEmail = process.env.ADMIN_EMAIL || "himanshujangir16@gmail.com";

        await sendEmail({
          to: [adminEmail],
          subject: `New Quick Match Application - ${determinedCompanyName}`,
          html: emailHtml,
          from: "Funding Match <les@fundingmatch.ai>",
          attachments: emailAttachments
        });
        console.log(`Admin email sent to ${adminEmail}`);
        emailSent = true;

        await prisma.quickMatchApplication.update({
          where: { id: application.id },
          data: { reportSent: true }
        });
      }
    } catch (emailErr) {
      console.error("Failed to send admin email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      matches: matched,
      unmatched: unmatched,
      applicationId: application.id
    });

  } catch (error: any) {
    console.error("Error matching lenders / saving to DB:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process application" },
      { status: 500 }
    );
  }
}
