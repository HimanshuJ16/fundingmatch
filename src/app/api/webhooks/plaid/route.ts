import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { generateQuickMatchEmailHtml } from "@/lib/email-templates/quick-match-admin";
import { generatePlaidReport } from "@/lib/plaid-report";
import { matchLenders, ApplicationData } from "@/lib/lender-rules"; // Re-use logic

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { webhook_type, webhook_code, item_id } = body;

    console.log(`Received Plaid Webhook: ${webhook_type} | ${webhook_code} | Item: ${item_id}`);

    // We care about TRANSACTIONS updates indicating history is ready
    // 'HISTORICAL_UPDATE' is the main one for "initial 2 years ready"
    // 'DEFAULT_UPDATE' allows fetching, but HISTORICAL is safer for full report.
    // 'SYNC_UPDATES_AVAILABLE' is the modern one.
    // Let's listen for all relevant completion events.
    const relevantCodes = ["HISTORICAL_UPDATE", "SYNC_UPDATES_AVAILABLE"];

    // Check if valid webhook
    if (webhook_type === "TRANSACTIONS" && relevantCodes.includes(webhook_code)) {

      // For SYNC_UPDATES_AVAILABLE, strict check for historical readiness
      if (webhook_code === "SYNC_UPDATES_AVAILABLE" && !body.historical_update_complete) {
        console.log("SYNC_UPDATES_AVAILABLE but historical data not ready. Ignoring.");
        return NextResponse.json({ received: true });
      }

      // Proceed if HISTORICAL_UPDATE or (SYNC_UPDATES_AVAILABLE && historical_update_complete)

      // 1. Find the Connection & Application
      const connection = await prisma.plaidConnection.findFirst({
        where: { itemId: item_id },
        include: {
          application: {
            include: {
              directors: true
            }
          }
        }
      });

      if (!connection || !connection.application) {
        // If no application, it means the user hasn't submitted Step 8 yet.
        // Return error to force Plaid to RETRY this webhook later.
        console.log("No application found for this webhook item. Returning 404 to trigger retry.");
        return NextResponse.json({ error: "Application not found yet" }, { status: 404 });
      }

      const application = connection.application;

      // check if we want to re-send? 
      // Ideally we should have an 'emailSent' flag. 
      // For now, we assume if we are receiving this, we might need to send it.
      // BUT, we don't want to spam on every update.
      // We only want to send IF it was skipped previously.
      // Since we didn't add a database flag, this is tricky. 
      // Assumption: The user just submitted, `match-lenders` skipped. 
      // The webhook fires 1 min later. We send.

      // RISK: Webhook fires multiple times or for old apps.
      // Mitigation: Check `createdAt`. If app is older than 1 hour? 24 hours? 
      // Or check if we already have a report?

      // Simple logic for this Task:
      // If the app was created recently (e.g. last hour) AND we receive HISTORICAL_UPDATE, send it.

      // Deduplication: Check if report was already sent by match-lenders
      if (application.reportSent) {
        console.log("Report already sent for this application. Skipping webhook.");
        return NextResponse.json({ received: true });
      }

      console.log(`Processing Async Report for App ID: ${application.id}`);

      // 2. Generate Report (with retry logic built-in, but now it should be ready)
      // We accept that this might take 30s. Vercel functions can run for 10-60s.
      const reports = await generatePlaidReport(
        connection.accessToken,
        application.companyName || "Unknown",
        application.companyNumber || undefined
      );

      // 3. Re-Construct Email Data
      // We need to re-run specific logic or load from DB.
      // `application` has most data, but `bankAnalysis` is JSON.
      // `matchedLenders` is JSON.

      // Re-hydrate ApplicationData for template
      // (Simplified mapping - retrieving from DB JSON)
      const bankAnalysis = application.bankStatementAnalysis as any || {};
      // const matchedLenders = application.matchedLenders as any || []; // DB only has positives. We need full results.
      const experianCompanyData = application.experianCompanyData as any || {};

      // Director Data
      const director = application.directors[0];
      const experianDirectorData = director?.experianData as any || {};

      const formData = {
        // Re-map db fields to form-like structure for template
        businessType: application.businessType,
        companyName: application.companyName,
        companyRegistrationNumber: application.companyNumber,
        registeredAddress: application.registeredAddress,
        email: application.email,
        mobileNumber: application.mobileNumber,
        fundingAmount: application.fundingAmount?.toString(),
        consentCreditCheck: application.creditCheckConsent,
        tradingName: application.companyName, // Fallback

        firstName: "",
        lastName: "",
        residentialAddress: "",
        homeOwnerStatus: false,
        directorDateOfBirth: "",
        directorName: ""
      };

      if (director) {
        formData.firstName = director.firstName;
        formData.lastName = director.lastName;
        formData.residentialAddress = director.residentialAddress;
        formData.homeOwnerStatus = director.homeowner;
        formData.directorDateOfBirth = director.dob ? new Date(director.dob).toISOString() : "";
        formData.directorName = `${director.firstName} ${director.lastName}`;
      }

      // Re-construct `applicationData` object for the template to match match-lenders logic
      const applicationData: ApplicationData = {
        company: {
          type: application.businessType as any,
          timeTradingMonths: parseInt(application.timeTrading || "0"),
          hasFiledAccounts: experianCompanyData.companyStatus === "Active",
          insolvencyEvents: (experianCompanyData.legalNotices?.count > 0 || experianCompanyData.insolvency?.count > 0),
          iva: false
        },
        credit: {
          experianScore: experianDirectorData.personalCreditScore || 0,
          experianDelphiScore: experianCompanyData.commercialDelphiScore || 0,
          experianBand: experianCompanyData.commercialBand
        },
        financials: {
          averageMonthlyTurnover: bankAnalysis.average_monthly_income || 0,
          averageMonthlyCardTurnover: bankAnalysis.average_monthly_card_turnover || 0,
          averageEodBalance: bankAnalysis.average_eod_balance || 0,
          lowBalanceDays: bankAnalysis.low_balance_days_count || 0,
          maxMonthlyLowBalanceDays: bankAnalysis.max_monthly_low_balance_occurrence || 0,
          negativeBalanceDays: bankAnalysis.negative_balance_days_count || 0,
          existingLenderCount: bankAnalysis.detected_repayments?.lenders?.length || 0,
          detectedCardProviders: bankAnalysis.detected_card_providers || []
        }
      };

      // Re-run matching to ensure we have full details including rejection reasons
      // (The DB only stores successful matches)
      console.log("Re-running matchLenders via Webhook to generate full report...");
      const results = matchLenders(applicationData);

      const emailHtml = generateQuickMatchEmailHtml({
        formData: formData as any,
        applicationData: applicationData,
        bankAnalysis: bankAnalysis,
        matchedLenders: results
      });

      const adminEmail = process.env.ADMIN_EMAIL || "himanshujangir16@gmail.com";
      const attachments = reports.map(r => ({
        filename: r.filename,
        content: r.buffer,
        contentType: "application/pdf"
      }));

      await sendEmail({
        to: [adminEmail],
        subject: `[ASYNC REPORT] New Quick Match Application - ${application.companyName}`,
        html: emailHtml,
        from: "Funding Match <les@fundingmatch.ai>",
        attachments: attachments
      });

      // Mark as sent in DB to prevent duplicates
      await prisma.quickMatchApplication.update({
        where: { id: application.id },
        data: { reportSent: true }
      });

      console.log("Async Email Sent Successfully via Webhook.");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
