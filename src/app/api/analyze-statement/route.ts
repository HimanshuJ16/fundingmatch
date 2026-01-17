import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { extractFromPdf } from "@/lib/pdf-provider";

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

    console.log(`Processing ${files.length} files...`);

    // Define the analysis function for a single file
    const analyzeSingleFile = async (file: File) => {
      let textContent = "";

      // Extract text based on file type
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        try {
          // console.log(`Processing PDF ${file.name} with LangChain PDFLoader...`);
          textContent = await extractFromPdf(file);
        } catch (e: any) {
          throw new Error(`PDF Parsing Error for ${file.name}: ${e.message}`);
        }
      } else if (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")) {
        textContent = await file.text();
      } else {
        throw new Error(`Unsupported file type for ${file.name}. Please upload PDF or CSV.`);
      }

      // Truncate text if it's too long
      const truncatedText = textContent.slice(0, 500000);

      const prompt = `
        You are an expert Financial Analyst AI. Analyze the following text extracted from a UK business bank statement (PDF or CSV).
        
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
           - Keywords to look for: "Loan", "Capital", "Finance", "Iwoca", "Funding Circle", "YouLend", "Libis", "Credit", "Advance", "Premium Credit".
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

        Bank Statement Text:
        """
        ${truncatedText}
        """
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: "You are a helpful financial assistant that outputs JSON." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });

      const analysisContent = completion.choices[0].message.content;
      if (!analysisContent) throw new Error("No analysis returned from OpenAI");

      return JSON.parse(analysisContent);
    };

    // Run analysis for all files in parallel
    const analysisResults = await Promise.all(
      files.map((file) => analyzeSingleFile(file))
    );

    console.log("Individual Analysis Results:", analysisResults);

    // Aggregate logic
    // We assume each file represents a separate period (e.g. 1 month).
    // So distinct monthly averages should be averaged together to get the "Overall Average Monthly Income".

    const validResults = analysisResults.filter(r => r); // Ensure no nulls if we handled errors loosely (here we throw, so it's fine)

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

    // Averages across the number of files (assuming 1 file = 1 month/period)
    const count = validResults.length;
    aggregatedData.average_monthly_income = totalIncomeSum / count;
    aggregatedData.average_eod_balance = totalEodSum / count; // Average of averages

    // Repayments are cumulative count/amount over the period? 
    // Usually "Monthly Repayments" is what matters for affordability.
    // But the detected_repayments structure asks for "count" and "total_amount".
    // If the UI shows "Detected Repayments", it usually means "What did we find in these files?"
    // If we find 2 loans in Month 1 and 2 loans in Month 2 (same loans), should we say 4 detected?
    // However, the prompt asks for "Existing Repayments".
    // Let's sum strictly for now as per "Analysis of these files".
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
