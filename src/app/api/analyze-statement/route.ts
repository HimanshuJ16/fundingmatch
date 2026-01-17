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
        You are an expert Financial Analyst AI. Analyze the attached bank statement file.
        
        Your job: Extract specific financial metrics and return a Strict JSON object.

        STRICT JSON OUTPUT ONLY:
        {
          "_thought_process": "Brief reasoning for calculations",
          "average_monthly_income": number,
          "average_eod_balance": number,
          "detected_repayments": {
            "count": number,
            "total_amount": number,
            "lenders": string[]
          },
          "currency_code": string
        }

        ════════════════════════════
        METRICS TO EXTRACT
        ════════════════════════════
        1. **Average Monthly Income**: 
           - Sum of all inflows (credits). 
           - Divide by the number of months represented in the statement (usually 1 if it's a monthly statement).
           - Exclude obvious internal transfers or refunds if clearly identifiable.

        2. **Average End of Day Balance**: 
           - Estimate the typical daily balance.
           - If a running balance column exists, use that.
           - Otherwise, average the starting and ending balances of the period.

        3. **Existing Repayments**: 
           - Identify recurring payments to lenders/financing companies.
           - Keywords to look for: "loan", "repayment", "instalment", "installment", "instlmnt", "emi", "credit", "finance", "financing", "lending", "capital", "advance", "agreement", "settlement", "debt", "borrow", "iwoca", "funding circle", "youlend", "libis", "fleximize", "esme loans", "marketfinance", "thincats", "capify", "worldpay advance", "tide cashflow", "nucleus commercial finance", "boost capital", "just cashflow", "365 finance", "lombard", "bibby", "white oak", "ultimate finance", "shawbrook", "allica", "close brothers", "paragon", "metro bank business loan", "hsbc business loan", "barclays business loan", "lloyds business loan", "natwest business loan", "santander business loan", "zopa", "ratesetter", "rate setter", "amigo", "koyo", "118 118 money", "oakbrook", "drafty", "lending stream", "sunny", "satsuma", "peachy", "everyday loans", "novuna", "creation finance", "mbna", "tesco bank loan", "virgin money loan", "halifax loan", "klarna", "clearpay", "laybuy", "paypal credit", "paypal pay in 3", "monzo flex", "barclaycard", "capital one", "aqua card", "vanquis", "newday", "marbles", "fluid card", "black horse", "hitachi capital", "close motor", "alphera", "lex autolease", "arval", "vw finance", "bmw finance", "mercedes finance", "quickquid", "wonga", "onga", "cashfloat", "myjar", "safety net credit", "barclays loan", "hsbc loan", "lloyds loan", "natwest loan", "santander loan", "metro bank loan", "tsb loan".
           - Sum their value and count them. 
           - List unique lender names.

        4. **Currency**: 
           - Detect the currency code (e.g., GBP, USD, EUR). Default to "GBP".

        ════════════════════════════
        STRICT REQUIREMENTS
        ════════════════════════════
        - JSON ONLY — no narrative outside JSON.
        - All numbers must be valid numbers (no currency symbols or commas in the number value).
        - If a value is not found, default to 0.
      `;

      // Use the new responses API if available (based on user request and SDK v6)
      try {
        // @ts-ignore - responses might not be fully typed in all environments yet
        const response = await openai.responses.create({
          model: "gpt-5-mini", // Using gpt-4o as it supports vision/files
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
      currency_code: validResults[0].currency_code || "GBP"
    };

    let totalIncomeSum = 0;
    let totalEodSum = 0;
    let totalRepaymentCount = 0;
    let totalRepaymentAmount = 0;
    const allLenders = new Set<string>();

    validResults.forEach((res) => {
      totalIncomeSum += (res.average_monthly_income || 0);
      totalEodSum += (res.average_eod_balance || 0);

      const repayments = res.detected_repayments || { count: 0, total_amount: 0, lenders: [] };
      totalRepaymentCount += (repayments.count || 0);
      totalRepaymentAmount += (repayments.total_amount || 0);

      if (Array.isArray(repayments.lenders)) {
        repayments.lenders.forEach((l: string) => allLenders.add(l));
      }
    });

    const count = validResults.length;
    aggregatedData.average_monthly_income = totalIncomeSum / count;
    aggregatedData.average_eod_balance = totalEodSum / count;

    aggregatedData.detected_repayments.count = totalRepaymentCount;
    aggregatedData.detected_repayments.total_amount = totalRepaymentAmount;
    aggregatedData.detected_repayments.lenders = Array.from(allLenders);

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
