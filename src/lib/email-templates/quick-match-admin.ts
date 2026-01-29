import { ApplicationData, Lender } from "@/lib/lender-rules";

interface QuickMatchEmailProps {
  formData: any;
  applicationData: ApplicationData;
  bankAnalysis: any;
  matchedLenders: Lender[];
}

export function generateQuickMatchEmailHtml({
  formData,
  applicationData,
  bankAnalysis,
  matchedLenders,
}: QuickMatchEmailProps): string {
  const { company, credit, financials } = applicationData;
  const matched = matchedLenders.filter((l) => l.match);
  const rejected = matchedLenders.filter((l) => !l.match);

  // Safely access nested properties
  const repaymentCount = bankAnalysis?.detected_repayments?.count || 0;
  const repaymentValue = bankAnalysis?.detected_repayments?.total_amount || 0;

  // Helper for row styles
  const sectionTitleStyle = "margin: 0 0 10px; color: #182744; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;";
  const labelStyle = "margin: 0; color: #52525b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;";
  const valueStyle = "margin: 4px 0 0; color: #18181b; font-size: 15px; line-height: 1.4;";
  const rowStyle = "padding-bottom: 15px; padding-top: 15px; border-bottom: 1px solid #f4f4f5;";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>New Quick Match Application</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #182744; padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">New Application</h1>
              <p style="color: #94a3b8; margin: 5px 0 0; font-size: 14px;">Quick Match Submission</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              
              <!-- Applicant Details -->
              <h2 style="${sectionTitleStyle}">Applicant Details</h2>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="50%" style="${rowStyle}">
                    <p style="${labelStyle}">Full Name</p>
                    <p style="${valueStyle}">${formData.firstName || formData.directorName || "N/A"} ${formData.lastName || ""}</p>
                  </td>
                  <td width="50%" style="${rowStyle}">
                    <p style="${labelStyle}">Date of Birth</p>
                    <p style="${valueStyle}">${formData.directorDateOfBirth ? new Date(formData.directorDateOfBirth).toLocaleDateString("en-GB") : "N/A"}</p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="${rowStyle}">
                     <p style="${labelStyle}">Email</p>
                     <p style="${valueStyle}"><a href="mailto:${formData.email}" style="color: #2563eb; text-decoration: none;">${formData.email || "N/A"}</a></p>
                  </td>
                  <td width="50%" style="${rowStyle}">
                    <p style="${labelStyle}">Mobile</p>
                    <p style="${valueStyle}"><a href="tel:${formData.mobileNumber}" style="color: #2563eb; text-decoration: none;">${formData.mobileNumber || "N/A"}</a></p>
                  </td>
                </tr>
                 <tr>
                  <td colspan="2" style="${rowStyle}">
                    <p style="${labelStyle}">Residential Address</p>
                    <p style="${valueStyle}">${formData.residentialAddress || "N/A"}</p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="${rowStyle} border-bottom: none;">
                    <p style="${labelStyle}">Homeowner</p>
                    <p style="${valueStyle}">${formData.homeOwnerStatus ? "Yes" : "No"}</p>
                  </td>
                   <td width="50%" style="${rowStyle} border-bottom: none;">
                    <p style="${labelStyle}">Funding Request</p>
                    <p style="${valueStyle} font-weight: bold;">£${formData.fundingAmount || 0}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px;">
              <!-- Company Info -->
              <h2 style="${sectionTitleStyle}">Company Information</h2>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td colspan="2" style="${rowStyle}">
                    <p style="${labelStyle}">Company Name</p>
                    <p style="${valueStyle}">${company.type === 'sole_trader' ? formData.tradingName : formData.companyName}</p>
                  </td>
                </tr>
                 <tr>
                  <td width="50%" style="${rowStyle}">
                    <p style="${labelStyle}">Registration No</p>
                    <p style="${valueStyle}">${formData.companyRegistrationNumber || "N/A"}</p>
                  </td>
                  <td width="50%" style="${rowStyle}">
                    <p style="${labelStyle}">Business Type</p>
                    <p style="${valueStyle}">${company.type === "limited_company" ? "Limited Company" : "Sole Trader"}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="${rowStyle}">
                    <p style="${labelStyle}">Registered Address</p>
                    <p style="${valueStyle}">${formData.registeredAddress || "N/A"}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="${rowStyle} border-bottom: none;">
                    <p style="${labelStyle}">Time Trading</p>
                    <p style="${valueStyle}">${(company.timeTradingMonths / 12).toFixed(1)} years (${company.timeTradingMonths} months)</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px;">
              <!-- Financials -->
              <h2 style="${sectionTitleStyle}">Financial Analysis (AI)</h2>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="50%" style="${rowStyle}">
                    <p style="${labelStyle}">Avg Monthly Turnover</p>
                    <p style="${valueStyle}">£${financials.averageMonthlyTurnover.toFixed(2)}</p>
                  </td>
                  <td width="50%" style="${rowStyle}">
                    <p style="${labelStyle}">Avg EOD Balance</p>
                    <p style="${valueStyle}">£${financials.averageEodBalance.toFixed(2)}</p>
                  </td>
                </tr>
                 <tr>
                  <td width="50%" style="${rowStyle}">
                    <p style="${labelStyle}">Card Turnover</p>
                    <p style="${valueStyle}">£${financials.averageMonthlyCardTurnover.toFixed(2)}</p>
                  </td>
                   <td width="50%" style="${rowStyle}">
                    <p style="${labelStyle}">Negative Balance Days</p>
                    <p style="${valueStyle}">${financials.negativeBalanceDays}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="${rowStyle}">
                    <p style="${labelStyle}">Detected Card Providers</p>
                    <p style="${valueStyle}">${financials.detectedCardProviders.join(", ") || "None"}</p>
                  </td>
                </tr>
                 <tr>
                  <td width="50%" style="${rowStyle}">
                    <p style="${labelStyle}">Detected Repayments</p>
                    <p style="${valueStyle}">${repaymentCount}</p>
                  </td>
                   <td width="50%" style="${rowStyle}">
                    <p style="${labelStyle}">Repayment Value</p>
                    <p style="${valueStyle}">£${repaymentValue.toFixed(2)}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="${rowStyle} border-bottom: none;">
                    <p style="${labelStyle}">Detected Lenders</p>
                     <p style="${valueStyle}">${bankAnalysis?.detected_repayments?.lenders?.join(", ") || "None"}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px;">
              <!-- Credit Info -->
              <h2 style="${sectionTitleStyle}">Credit Information</h2>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="50%" style="${rowStyle}">
                    <p style="${labelStyle}">Personal Score (Dir)</p>
                    <p style="${valueStyle}">${credit.experianScore}</p>
                  </td>
                  <td width="50%" style="${rowStyle}">
                    <p style="${labelStyle}">Commercial Band</p>
                    <p style="${valueStyle}">${credit.experianBand || "N/A"}</p>
                  </td>
                </tr>
                 <tr>
                  <td width="50%" style="${rowStyle} border-bottom: none;">
                    <p style="${labelStyle}">Commercial Delphi</p>
                    <p style="${valueStyle}">${credit.experianDelphiScore || "N/A"}</p>
                  </td>
                   <td width="50%" style="${rowStyle} border-bottom: none;">
                    <p style="${labelStyle}">Insolvency Events</p>
                    <p style="${valueStyle}">${company.insolvencyEvents ? "Yes" : "No"}</p>
                  </td>
                </tr>
                <tr>
                   <td colspan="2" style="${rowStyle} border-bottom: none; border-top: 1px solid #f4f4f5;">
                    <p style="${labelStyle}">Credit Check Consent</p>
                    <p style="${valueStyle}">${formData.consentCreditCheck ? "Given" : "Not Given"}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

           <tr>
            <td style="padding: 20px 40px 40px;">
              <!-- Matching Results -->
              <h2 style="${sectionTitleStyle}">Matching Results</h2>
              
              <div style="margin-bottom: 20px;">
                 <p style="${labelStyle}">Overall Status</p>
                 <p style="margin-top: 5px; font-size: 16px; font-weight: bold; color: ${matched.length > 0 ? '#16a34a' : '#dc2626'};">
                    ${matched.length > 0 ? 'MATCHED' : 'NO MATCH'}
                 </p>
              </div>

              ${matched.length > 0 ? `
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
                  <h4 style="margin: 0 0 10px; color: #166534; font-size: 15px;">Qualifying Lenders (${matched.length})</h4>
                  <ul style="margin: 0; padding-left: 20px; color: #15803d;">
                    ${matched.map(l => `<li style="margin-bottom: 8px;"><strong>${l.name}</strong><br/><span style="font-size: 13px; color: #4b5563;">${l.reasons.join(", ")}</span></li>`).join("")}
                  </ul>
                </div>
              ` : ''}

              ${rejected.length > 0 ? `
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px;">
                  <h4 style="margin: 0 0 10px; color: #991b1b; font-size: 15px;">Disqualified Lenders (${rejected.length})</h4>
                  <ul style="margin: 0; padding-left: 20px; color: #b91c1c;">
                    ${rejected.map(l => `<li style="margin-bottom: 8px;"><strong>${l.name}</strong><br/><span style="font-size: 13px; color: #4b5563;">${l.refusal_reasons.join(", ")}</span></li>`).join("")}
                  </ul>
                </div>
              ` : ''}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">Sent via Funding Match AI Engine</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
