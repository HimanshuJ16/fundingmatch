import { NextResponse } from "next/server";
import { OpenAI } from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    // Get all files from the form data
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    console.log(`Processing ${files.length} files with Native OpenAI PDF Input...`);

    // Define the analysis function for a single file
    const analyzeSingleFile = async (file: File) => {

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      let inputPayload: any;

      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        // Handle PDF: Convert to Base64
        const base64String = fileBuffer.toString("base64");
        inputPayload = {
          type: "input_file",
          filename: file.name,
          file_data: `data:application/pdf;base64,${base64String}`,
        };
      } else if (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")) {
        // Handle CSV: Send as text
        // Note: The responses API structure uses "input_text"
        inputPayload = {
          type: "input_text",
          text: fileBuffer.toString("utf-8"),
        };
      } else {
        throw new Error(`Unsupported file type for ${file.name}. Please upload PDF or CSV.`);
      }

      const prompt = `
      You are a professional Financial Analysis Engine.

You will be given a bank statement (PDF text or CSV).
Your task is to parse it and return a SINGLE, VALID JSON OBJECT that follows the schema exactly.

━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (JSON ONLY)
━━━━━━━━━━━━━━━━━━━━
{
  "_thought_process": "Brief explanation of how values were derived (e.g., 'Detected 33 days of data, treated as 1.1 months. Excluded 'Transfer from Savings' from income. Identified 'Dojo' credits as Card Turnover.'). List top 3 income sources identified.",
  "average_monthly_income": number,
  "average_eod_balance": number,
  "detected_repayments": {
    "count": number,
    "total_amount": number,
    "lenders": string[]
  },
  "low_balance_days_count": number, // Total count of days where EOD balance < 300 across the entire period
  "max_monthly_low_balance_occurrence": number, // The highest count of low balance days in ANY SINGLE month
  "analyzed_months_count": number, // Number of months covered by this statement
  "negative_balance_days_count": number, // Count of days where EOD balance < 0
  "average_monthly_card_turnover": number, // Revenue specifically from card processors (POS)
  "detected_card_providers": string[], // List of detected card processor names
  "currency_code": string
}

⚠️ Rules:
- Output MUST be valid JSON.
- All numbers must be plain numbers (no symbols, commas).
- Return 0 if a value cannot be determined.
- Do NOT guess. Derive strictly from the file.

━━━━━━━━━━━━━━━━━━━━
CALCULATION LOGIC (STRICT)
━━━━━━━━━━━━━━━━━━━━

1. PRE-PROCESSING & DATES:
- **Currency:** Check IBAN (e.g., "GB" = GBP) or currency symbols. Default to GBP.
- **Date Range:** Identify the *First Transaction Date* and *Last Transaction Date*.
- **Month Normalization (Crucial):**
  - Calculate Total_Days = (Last Date - First Date) + 1.
  - If "Total_Days" <= 45: Treat as **1 Month** (Divisor = 1).
  - If "Total_Days" > 45: Calculate "Months = Total_Days / 30.44".
  - Use this calculated "Months" value for "analyzed_months_count" and "Average Monthly" calculations.

2. AVERAGE MONTHLY INCOME:
- Identify all CREDIT / INFLOW transactions.
- **INCLUSIONS (Sources of Revenue):**
  - **Card Turnover:** Credits from Dojo, Worldpay, Barclaycard, SumUp, Stripe, etc. are **ALWAYS INCOME**. Do NOT exclude them even if they appear in the "Lenders" list below.
  - **General Sales:** Credits from customers, invoices, etc.
- **CRITICAL EXCLUSIONS (MUST REMOVE):**
  - **Opening Balances:** "Opening Balance", "Brought Forward", "B/F", "Balance Start", "Start Balance". (These are NOT income).
  - **Internal Transfers:** Transfers from own accounts. Look for "Transfer from Savings", "TFR", "Sweep", "From Account", "Internal Transfer", or if Sender Name matches Account Name.
  - **Refunds:** Checks, reversals, or "Refund".
  - **Loan/Capital Payouts:** Large round sums from identified lenders. **SPECIFICALLY EXCLUDE CREDITS FROM:**
    - "Iwoca", "Funding Circle", "YouLend", "Libis", "Fleximize"
    - "Capify", "Capital On Tap", "Advantis", "UK SME Cap", "Admiral Taverns"
    - "NatWest Business Loan", "NWB", "Bounce Back Loan", "CBILS"
  - **Government Grants:** "Bounce Back Loan", "Coronavirus Job Retention".
- **Calculation:** (Sum of valid inflows) ÷ (Calculated Months).

3. END-OF-DAY (EOD) BALANCE & HEALTH:
- Scan the "Balance" column.
- **Sign Detection (Critical):**
  - If a balance has a suffix "D", "Dr", "Debit", "OD", or is enclosed in "()", treat it as **NEGATIVE**.
  - Example: "15,000 D" = -15000.
- **Metrics:**
  - "average_eod_balance": Arithmetic mean of all daily closing balances.
  - "low_balance_days_count": Count of days where Balance < 300.
  - "max_monthly_low_balance_occurrence": Group days by month. Count low balance days per month. Return the MAXIMUM count found in any single month.
  - "negative_balance_days_count": Count of days where Balance < 0.
- If no running balance column exists, return 0 for counts.

4. REPAYMENTS & DEBT:
- Scan all DEBIT transactions.
- A repayment is any payment that matches the following **Keywords** OR **Known Lenders**:

  **A. Match against these lender keywords:**
  "loan", "repayment", "instalment", "installment", "instlmnt", "emi", "credit", "finance", "financing", "lending", "capital", "advance", "agreement", "settlement", "debt", "borrow"

  **B. Match against these specific Lenders:**
  - *Business/Fintech:* "iwoca", "funding circle", "youlend", "libis", "fleximize", "esme loans", "marketfinance", "thincats", "capify", "worldpay advance", "tide cashflow", "nucleus commercial finance", "boost capital", "just cashflow", "365 finance", "lombard", "bibby", "white oak", "ultimate finance", "shawbrook", "allica", "close brothers", "paragon", "uk sme cap", "advantis"
  - *Bank Loans:* "metro bank business loan", "hsbc business loan", "barclays business loan", "lloyds business loan", "natwest business loan", "nwb business loan", "santander business loan", "barclays loan", "hsbc loan", "lloyds loan", "natwest loan", "santander loan", "metro bank loan", "tsb loan"
  - *Consumer/High Cost:* "zopa", "ratesetter", "rate setter", "amigo", "koyo", "118 118 money", "oakbrook", "drafty", "lending stream", "sunny", "satsuma", "peachy", "everyday loans", "quickquid", "wonga", "onga", "cashfloat", "myjar", "safety net credit"
  - *Cards/Retail Finance:* "novuna", "creation finance", "mbna", "tesco bank loan", "virgin money loan", "halifax loan", "klarna", "clearpay", "laybuy", "paypal credit", "paypal pay in 3", "monzo flex", "barclaycard", "capital one", "aqua card", "vanquis", "newday", "marbles", "fluid card"
  - *Vehicle:* "black horse", "hitachi capital", "close motor", "alphera", "lex autolease", "arval", "vw finance", "bmw finance", "mercedes finance"

- **Calculation:**
  - "count": Number of individual repayment transactions.
  - "total_amount": Sum of absolute values of these transactions.
  - "lenders": List of unique names (clean string, remove duplicates).

5. CARD TURNOVER (MERCHANT SERVICES):
- Scan CREDIT / INFLOW transactions.
- Look for recurring settlement credits strictly from these providers:
  - Worldpay (WORLD PAY, WORLDPAY, WPY, VANTIV)
  - Barclaycard (BARCLAYCARD, BCL CARD SERV)
  - Elavon (ELAVON, ELAVON FIN SERV)
  - Global Payments (GLOBAL PAYMENTS, GPUK)
  - FIS / First Data (FIRST DATA, FDMS)
  - Dojo (DOJO)
  - Teya (TEYA, TEYA PAYMENTS, TEYA SETTLEMENT)
  - SumUp (SUMUP)
  - Square (SQUARE, SQUAREUP)
  - Zettle (IZETTLE)
  - Viva Wallet (VIVA WALLET)
  - Lloyds Cardnet (LLOYDS CARDNET, CARDNET)
  - Bank of Scotland Cardnet (BOS CARDNET)
  - AIB Merchant Services (AIB MS)
  - Paymentsense, Handepay, Takepayments, EVO Payments, TSYS
  - Stripe, PayPal, Adyen, Checkout.com
- **Calculation:** (Sum of these specific transactions) ÷ (Calculated Months).
- **Note:** Treat "Uber Eats", "Just Eat", and "Deliveroo" as general income, NOT Card Turnover, unless explicitly requested.

━━━━━━━━━━━━━━━━━━━━
FINAL CHECK
━━━━━━━━━━━━━━━━━━━━
Before responding:
- Validate JSON structure
- Ensure "average_monthly_income" >= "average_monthly_card_turnover".
- Ensure "detected_repayments.lenders" does not contain duplicates.
- Ensure no fields are missing
- Ensure all numbers are valid
- Ensure lenders are unique
- Ensure no hallucinated data

Return ONLY the JSON object.
      `;

      // Use the new responses API if available (based on user request and SDK v6)
      try {
        // @ts-ignore - responses might not be fully typed in all environments yet
        const response = await openai.responses.create({
          model: "gpt-5.1",
          input: [
            {
              role: "user",
              content: [
                inputPayload,
                {
                  type: "input_text",
                  text: prompt
                }
              ]
            }
          ]
        });

        // Output from responses API
        const analysisContent = response.output_text;

        if (!analysisContent) throw new Error("No analysis returned from OpenAI");

        // Clean markdown block if present ```json ... ```
        const cleanContent = analysisContent.replace(/```json\n|```/g, "").trim();
        return JSON.parse(cleanContent);

      } catch (err: any) {
        console.error(`Error processing file ${file.name} with responses API:`, err);

        // Fallback to chat completions if responses API fails (e.g. if SDK version or model doesn't support it perfectly yet)
        // But the user specifically asked for this. I will assume it works or throw.
        throw err;
      }
    };

    // Run analysis for all files in parallel
    const analysisResults = await Promise.all(
      files.map((file) => analyzeSingleFile(file))
    );

    console.log("Individual Analysis Results:", analysisResults);

    // Aggregate logic
    const validResults = analysisResults.filter(r => r);

    if (validResults.length === 0) {
      throw new Error("No valid analysis results generated.");
    }

    const aggregatedData = {
      _thought_process: "Aggregated from multiple files",
      average_monthly_income: 0,
      average_eod_balance: 0,
      detected_repayments: {
        count: 0,
        total_amount: 0,
        lenders: [] as string[]
      },
      low_balance_days_count: 0,
      negative_balance_days_count: 0,
      average_monthly_card_turnover: 0,
      detected_card_providers: [] as string[],
      currency_code: validResults[0].currency_code || "GBP",
      max_monthly_low_balance_occurrence: 0,
    };

    let totalIncomeSum = 0;
    let totalEodSum = 0;
    let totalRepaymentCount = 0;
    let totalRepaymentAmount = 0;
    let totalLowBalanceDays = 0;
    let maxMonthlyLowBalance = 0;
    let totalNegativeBalanceDays = 0;
    let totalCardTurnoverSum = 0;
    const allLenders = new Map<string, string>(); // normalized -> display
    const allCardProviders = new Map<string, string>(); // normalized -> display

    validResults.forEach((res) => {
      totalIncomeSum += (res.average_monthly_income || 0);
      totalEodSum += (res.average_eod_balance || 0);
      totalLowBalanceDays += (res.low_balance_days_count || 0);
      maxMonthlyLowBalance = Math.max(maxMonthlyLowBalance, res.max_monthly_low_balance_occurrence || 0);
      totalNegativeBalanceDays += (res.negative_balance_days_count || 0);
      totalCardTurnoverSum += (res.average_monthly_card_turnover || 0);

      const repayments = res.detected_repayments || { count: 0, total_amount: 0, lenders: [] };
      totalRepaymentCount += (repayments.count || 0);
      totalRepaymentAmount += (repayments.total_amount || 0);

      if (Array.isArray(repayments.lenders)) {
        repayments.lenders.forEach((l: string) => {
          const normalized = l.trim().toLowerCase();
          if (!allLenders.has(normalized)) {
            allLenders.set(normalized, l.trim());
          }
        });
      }

      if (Array.isArray(res.detected_card_providers)) {
        res.detected_card_providers.forEach((p: string) => {
          const normalized = p.trim().toLowerCase();
          if (!allCardProviders.has(normalized)) {
            allCardProviders.set(normalized, p.trim());
          }
        });
      }
    });

    const count = validResults.length;
    aggregatedData.average_monthly_income = totalIncomeSum / count;
    aggregatedData.average_eod_balance = totalEodSum / count;
    aggregatedData.average_monthly_card_turnover = totalCardTurnoverSum / count;

    aggregatedData.detected_repayments.count = totalRepaymentCount;
    aggregatedData.detected_repayments.total_amount = totalRepaymentAmount;
    aggregatedData.detected_repayments.lenders = Array.from(allLenders.values());

    aggregatedData.low_balance_days_count = totalLowBalanceDays;
    aggregatedData.max_monthly_low_balance_occurrence = maxMonthlyLowBalance;
    aggregatedData.negative_balance_days_count = totalNegativeBalanceDays;
    aggregatedData.detected_card_providers = Array.from(allCardProviders.values());

    console.log("Aggregated Analysis:", aggregatedData);

    return NextResponse.json({
      success: true,
      data: aggregatedData,
    });

  } catch (error: any) {
    console.error("Error analyzing statements:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze statements" },
      { status: 500 }
    );
  }
}
