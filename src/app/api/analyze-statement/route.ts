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

You will be given a bank statement (PDF or CSV).
Your task is to parse it and return a SINGLE, VALID JSON OBJECT that follows the schema exactly.

━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (JSON ONLY)
━━━━━━━━━━━━━━━━━━━━
{
  "_thought_process": "Very brief explanation of how values were derived",
  "average_monthly_income": number,
  "average_eod_balance": number,
  "detected_repayments": {
    "count": number,
    "total_amount": number,
    "lenders": string[]
  },
  "low_balance_days_count": number, // Count of days where EOD balance < 300
  "negative_balance_days_count": number, // Count of days where EOD balance < 0
  "average_monthly_card_turnover": number, // Revenue specifically from card processors
  "detected_card_providers": string[], // List of detected card processor names
  "currency_code": string
}

⚠️ Rules:
- Output MUST be valid JSON. No markdown. No commentary outside JSON.
- All numbers must be plain numbers (no symbols, commas, or text).
- If any value cannot be determined, return 0.
- Do NOT guess values. Only derive from the file.
- Do NOT invent lenders.
- Use decimals where appropriate.
- Use lowercase ISO currency codes (e.g., "GBP", "USD", "EUR").

━━━━━━━━━━━━━━━━━━━━
HOW TO CALCULATE
━━━━━━━━━━━━━━━━━━━━

1. Average Monthly Income:
- Identify all CREDIT / INFLOW transactions.
- Exclude:
  - Internal transfers between own accounts
  - Refund reversals
  - Obvious self-movements (same-name transfers)
- Group by calendar month found in the data.
- For each month:
  - Sum all qualifying inflows.
- Return:
  - (Sum of all monthly totals) ÷ (Number of distinct months)

If the file only covers one month, return that month’s total.

2. Average End-of-Day Balance & Low Balance Checks:
- If a running balance column exists:
  - Use all daily ending balances.
  - **CRITICAL:** Check for suffixes like "D", "Dr", "Debit", "OD", or enclosing parentheses (e.g., "4,500 D" or "(4,500)").
  - Treat these values as NEGATIVE (Overdraft).
  - Return the arithmetic mean for "average_eod_balance".
  - Count how many days the balance was below 300 for "low_balance_days_count".
  - Count how many days the balance was below 0 for "negative_balance_days_count".
- If not:
  - Use: (Opening Balance + Closing Balance) ÷ 2
  - Return 0 for counts as they cannot be accurately determined.

3. Existing Repayments:
- Scan all DEBIT transactions.
- A repayment is any payment that:
  - Appears recurring OR
  - Matches lender-related keywords OR
  - Is clearly a loan/finance/credit obligation

Match against these lender keywords:
"loan", "repayment", "instalment", "installment", "instlmnt", "emi", "credit", "finance", "financing", "lending", "capital", "advance", "agreement", "settlement", "debt", "borrow",
"iwoca", "funding circle", "youlend", "libis", "fleximize", "esme loans", "marketfinance", "thincats", "capify",
"worldpay advance", "tide cashflow", "nucleus commercial finance", "boost capital", "just cashflow", "365 finance",
"lombard", "bibby", "white oak", "ultimate finance", "shawbrook", "allica", "close brothers", "paragon",
"metro bank business loan", "hsbc business loan", "barclays business loan", "lloyds business loan",
"natwest business loan", "santander business loan",
"zopa", "ratesetter", "rate setter", "amigo", "koyo", "118 118 money", "oakbrook", "drafty",
"lending stream", "sunny", "satsuma", "peachy", "everyday loans",
"novuna", "creation finance", "mbna", "tesco bank loan", "virgin money loan", "halifax loan",
"klarna", "clearpay", "laybuy", "paypal credit", "paypal pay in 3", "monzo flex",
"barclaycard", "capital one", "aqua card", "vanquis", "newday", "marbles", "fluid card",
"black horse", "hitachi capital", "close motor", "alphera", "lex autolease", "arval",
"vw finance", "bmw finance", "mercedes finance",
"quickquid", "wonga", "onga", "cashfloat", "myjar", "safety net credit",
"barclays loan", "hsbc loan", "lloyds loan", "natwest loan", "santander loan", "metro bank loan", "tsb loan"

For detected repayments:
- Count each transaction that qualifies
- Sum their absolute debit values
- Extract unique lender names (cleaned, human-readable)

4. Card Turnover & Providers:
- Scan CREDIT / INFLOW transactions.
- Look for recurring settlement credits from these providers:
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
- Sum the total value of these specific transactions.
- Calculate average monthly total (Total Sum ÷ Months).
- List the unique provider names found.

5. Currency:
- Detect from symbols, headers, or metadata.
- If unclear, default to "GBP".

━━━━━━━━━━━━━━━━━━━━
FINAL CHECK
━━━━━━━━━━━━━━━━━━━━
Before responding:
- Validate JSON structure
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
      currency_code: validResults[0].currency_code || "GBP"
    };

    let totalIncomeSum = 0;
    let totalEodSum = 0;
    let totalRepaymentCount = 0;
    let totalRepaymentAmount = 0;
    let totalLowBalanceDays = 0;
    let totalNegativeBalanceDays = 0;
    let totalCardTurnoverSum = 0;
    const allLenders = new Map<string, string>(); // normalized -> display
    const allCardProviders = new Map<string, string>(); // normalized -> display

    validResults.forEach((res) => {
      totalIncomeSum += (res.average_monthly_income || 0);
      totalEodSum += (res.average_eod_balance || 0);
      totalLowBalanceDays += (res.low_balance_days_count || 0);
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
