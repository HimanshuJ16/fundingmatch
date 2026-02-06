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
        console.log("No application found for this webhook item.");
        return NextResponse.json({ received: true });
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
      const matchedLenders = application.matchedLenders as any || [];
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
        tradingName: application.companyName, // Fallback if sole trader stores here

        firstName: "",
        lastName: "",
        residentialAddress: "",
        homeOwnerStatus: false,
        directorDateOfBirth: "",
      };

      // We might need to fetch Directors to get names
      // We already included them in the query above
      const director = application.directors[0];
      if (director) {
        formData.firstName = director.firstName;
        formData.lastName = director.lastName;
        formData.residentialAddress = director.residentialAddress;
        formData.homeOwnerStatus = director.homeowner;
        formData.directorDateOfBirth = director.dob ? new Date(director.dob).toISOString() : "";
      }

      // ... Re-construct `applicationData` object for the template ...
      const applicationData: ApplicationData = {
        company: {
          type: application.businessType as any,
          timeTradingMonths: parseInt(application.timeTrading || "0"),
          hasFiledAccounts: false, // fallback
          insolvencyEvents: false,
          iva: false
        },
        credit: { experianScore: 0, experianDelphiScore: 0 }, // fallbacks if not in DB root
        financials: {
          averageMonthlyTurnover: bankAnalysis.average_monthly_income || 0,
          // ... map others
          averageMonthlyCardTurnover: bankAnalysis.average_monthly_card_turnover || 0,
          averageEodBalance: bankAnalysis.average_eod_balance || 0,
          lowBalanceDays: bankAnalysis.low_balance_days_count || 0,
          maxMonthlyLowBalanceDays: bankAnalysis.max_monthly_low_balance_occurrence || 0,
          negativeBalanceDays: bankAnalysis.negative_balance_days_count || 0,
          existingLenderCount: bankAnalysis.detected_repayments?.count || 0,
          detectedCardProviders: bankAnalysis.detected_card_providers || []
        }
      };

      const emailHtml = generateQuickMatchEmailHtml({
        formData: formData as any,
        applicationData: applicationData,
        bankAnalysis: bankAnalysis,
        matchedLenders: matchedLenders
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

      console.log("Async Email Sent Successfully via Webhook.");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
