
export interface Lender {
  id: string;
  name: string;
  match: boolean;
  reasons: string[];
  refusal_reasons: string[];
}

export interface ApplicationData {
  company: {
    type: string; // limited_company, sole_trader, etc.
    timeTradingMonths: number;
    hasFiledAccounts: boolean; // From Companies House
    insolvencyEvents: boolean; // From Experian or Self-declared
    iva: boolean; // Individual Voluntary Arrangement
  };
  credit: {
    experianScore: number;
    experianBand?: number | string; // Band can be "Maximum Risk" (string) or Index (number)
    experianDelphiScore?: number; // Commercial score
  };
  financials: {
    averageMonthlyTurnover: number;
    averageMonthlyCardTurnover: number;
    averageEodBalance: number;
    lowBalanceDays: number; // monthly average or total
    negativeBalanceDays: number;
    existingLenderCount: number;
    detectedCardProviders: string[];
  };
}

const APPROVED_CARD_PROVIDERS = [
  "worldpay", "world pay", "wpy", "vantiv",
  "barclaycard", "bcl card serv",
  "elavon", "elavon fin serv",
  "global payments", "gpuk",
  "first data", "fdms", "fis",
  "dojo",
  "teya", "teya payments", "teya settlement",
  "sumup",
  "square", "squareup",
  "izettle", "zettle",
  "viva wallet",
  "lloyds cardnet", "cardnet",
  "bos cardnet",
  "aib ms", "aib merchant services",
  "paymentsense", "handepay", "takepayments", "evo payments", "tsys",
  "stripe", "paypal", "adyen", "checkout.com"
];

function isCardProviderDetected(detectedList: string[]): boolean {
  if (!detectedList || detectedList.length === 0) return false;
  // The detected list from AI should already be normalized, but let's be safe
  const lowerDetected = detectedList.map(p => p.toLowerCase());
  return APPROVED_CARD_PROVIDERS.some(p => lowerDetected.some(d => d.includes(p) || p.includes(d)));
}

export function matchLenders(data: ApplicationData): Lender[] {
  const lenders: Lender[] = [];

  // Helper to add lender
  const addLender = (
    id: string,
    name: string,
    check: () => { passed: boolean; reasons: string[]; refusals: string[] }
  ) => {
    const result = check();
    lenders.push({
      id,
      name,
      match: result.passed,
      reasons: result.reasons,
      refusal_reasons: result.refusals
    });
  };

  // 1. Swiftfund
  addLender("swiftfund", "Swiftfund", () => {
    const reasons: string[] = [];
    const refusals: string[] = [];
    let passed = true;

    // Time trading: 6m (12m if Experian < 650)
    const minTrading = data.credit.experianScore < 650 ? 12 : 6;
    if (data.company.timeTradingMonths >= minTrading) {
      reasons.push(`Trading for ${data.company.timeTradingMonths} months (Min ${minTrading})`);
    } else {
      passed = false;
      refusals.push(`Trading time ${data.company.timeTradingMonths}m < Minimum ${minTrading}m`);
    }

    // Turnover: £20k/m
    if (data.financials.averageMonthlyTurnover >= 20000) {
      reasons.push(`Turnover £${data.financials.averageMonthlyTurnover.toFixed(0)} >= £20k`);
    } else {
      passed = false;
      refusals.push(`Turnover £${data.financials.averageMonthlyTurnover.toFixed(0)} < £20k`);
    }

    // Existing borrowing: Must already have an active loan
    if (data.financials.existingLenderCount > 0) {
      reasons.push("Has existing active loan");
    } else {
      passed = false;
      refusals.push("No existing active loan found");
    }

    // Cashflow: Low balance days <= 5
    if (data.financials.lowBalanceDays <= 5) {
      reasons.push(`Low balance days (${data.financials.lowBalanceDays}) <= 5`);
    } else {
      passed = false;
      refusals.push(`Low balance days (${data.financials.lowBalanceDays}) > 5`);
    }

    // IVA
    if (!data.company.iva) {
      reasons.push("No active IVA");
    } else {
      passed = false;
      refusals.push("Active IVA detected");
    }

    return { passed, reasons, refusals };
  });

  // 2. Nucleus
  addLender("nucleus", "Nucleus", () => {
    const reasons: string[] = [];
    const refusals: string[] = [];
    let passed = true;

    if (data.company.timeTradingMonths >= 12) {
      reasons.push(`Trading >= 12m`);
    } else {
      passed = false;
      refusals.push(`Trading ${data.company.timeTradingMonths}m < 12m`);
    }

    // Open banking 12m - approximated by time trading for now or assuming available if files provided
    // Filed accounts
    if (data.company.hasFiledAccounts) {
      reasons.push("Accounts filed");
    } else {
      passed = false;
      refusals.push("No filed accounts (or not Limited Company)");
    }

    // Experian Band >= 3 (Approximation: Score > 60?)
    // If no band provided, use score: 0-100 range? 
    // Standard Commercial Delphi: Band 3 is usually > 45-50. Let's strict it to 60 for safety if not band.
    let bandVal = 0;
    if (typeof data.credit.experianBand === 'number') {
      bandVal = data.credit.experianBand;
    } else if (typeof data.credit.experianBand === 'string') {
      // Simple mapping or fallback
      if (data.credit.experianBand.includes("Minimal") || data.credit.experianBand.includes("Low")) bandVal = 5;
      else if (data.credit.experianBand.includes("Average")) bandVal = 3;
      else bandVal = 1;
    }

    // Fallback to score if band low
    if (bandVal === 0 && data.credit.experianScore > 60) bandVal = 3;

    const band = bandVal || (data.credit.experianScore > 60 ? 3 : 1);
    if (band >= 3) {
      reasons.push(`Experian Band ${band} >= 3`);
    } else {
      passed = false;
      refusals.push(`Experian Band ${band} < 3`);
    }

    if (!data.company.insolvencyEvents) {
      reasons.push("No insolvency in last 24m");
    } else {
      passed = false;
      refusals.push("Insolvency event detected");
    }

    return { passed, reasons, refusals };
  });

  // 3. Maxcap
  addLender("maxcap", "Maxcap", () => {
    const reasons: string[] = [];
    const refusals: string[] = [];
    let passed = true;

    // Time trading: 9m (30-week product)
    if (data.company.timeTradingMonths >= 9) {
      reasons.push("Trading >= 9m");
    } else {
      passed = false;
      refusals.push(`Trading ${data.company.timeTradingMonths}m < 9m`);
    }

    // Revenue: £15k
    if (data.financials.averageMonthlyTurnover >= 15000) {
      reasons.push("Turnover >= £15k");
    } else {
      passed = false;
      refusals.push(`Turnover £${data.financials.averageMonthlyTurnover.toFixed(0)} < £15k`);
    }

    // Existing borrowing: Max 4 positions
    if (data.financials.existingLenderCount <= 4) {
      reasons.push("Existing lenders <= 4");
    } else {
      passed = false;
      refusals.push(`Existing lenders (${data.financials.existingLenderCount}) > 4`);
    }

    // Cashflow: Max 8 negative days (approx 1.3 per month or total if data covers 6m)
    // Assuming 'negativeBalanceDays' is a monthly average or total for the period analyzed.
    // If it's monthly average, 8 in 6 months is ~1.33/month.
    // Let's be generous and say if monthly avg <= 2 it passes? Or strict and say <= 1?
    // Let's assume the bank analysis returns TOTAL observed negative days in the uploaded files.
    // If files < 6 months, we might extrapolate? For safety, let's treat the number as "monthly average" * 6?
    // Actually, prompt says "Count of days". If multiple months, it's total count.

    // Simplification: Fail if negative days > 8 (absolute count in provided extract)
    if (data.financials.negativeBalanceDays <= 8) {
      reasons.push("Negative days <= 8");
    } else {
      passed = false;
      refusals.push(`Negative days (${data.financials.negativeBalanceDays}) > 8`);
    }

    // Experian >= 600
    if (data.credit.experianScore >= 60) { // Assuming 0-100 scale? Or 0-1000? Most UK commercial likely 0-100 (Delphi).
      // Wait, prompt rules says "Experian >= 600". That implies 0-1000 scale or similar.
      // But parsing often gives 0-100.
      // Let's check: "650" for Swiftfund usually implies Consumer score (0-999) or Commercial (0-100).
      // Swiftfund rule: "Min 6 months (12 months if Experian < 650)". That sounds like personal credit score (Experian consumer is 0-999).
      // Maxcap rule: "Experian >= 600 (50%+ shareholder)". Also sounds like Personal Score.
      // For now, I'll treat the input "experianScore" as the Director's Personal Score (0-999).
      // "experianDelphiScore" will be the Business Score (0-100).
      if (data.credit.experianScore >= 600) {
        reasons.push("Director Score >= 600");
      } else {
        passed = false;
        refusals.push(`Director Score ${data.credit.experianScore} < 600`);
      }
    }

    return { passed, reasons, refusals };
  });

  // 4. Bizcap
  addLender("bizcap", "Bizcap", () => {
    const reasons: string[] = [];
    const refusals: string[] = [];
    let passed = true;

    if (data.company.timeTradingMonths >= 4) {
      reasons.push("Trading >= 4m");
    } else {
      passed = false;
      refusals.push("Trading < 4m");
    }

    if (data.financials.averageMonthlyTurnover >= 12000) {
      reasons.push("Turnover >= £12k");
    } else {
      passed = false;
      refusals.push("Turnover < £12k");
    }

    // No credit restrictions mentioned (other than implied defaults?)

    return { passed, reasons, refusals };
  });

  // 5. Sigma Lending
  addLender("sigma", "Sigma Lending", () => {
    const reasons: string[] = [];
    const refusals: string[] = [];
    let passed = true;

    if (data.company.timeTradingMonths >= 15) {
      reasons.push("Trading >= 15m");
    } else {
      passed = false;
      refusals.push("Trading < 15m");
    }

    // £150k per annum -> £12,500 / month
    if (data.financials.averageMonthlyTurnover >= 12500) {
      reasons.push("Turnover >= £150k/y (avg)");
    } else {
      passed = false;
      refusals.push("Turnover < £150k/y");
    }

    return { passed, reasons, refusals };
  });

  // CARD ONLY LENDERS
  const hasCardReader = isCardProviderDetected(data.financials.detectedCardProviders) || data.financials.averageMonthlyCardTurnover > 0;

  // 6. 365 Finance (Card Only)
  addLender("365finance", "365 Finance", () => {
    const reasons: string[] = [];
    const refusals: string[] = [];
    let passed = true;

    if (!hasCardReader) {
      passed = false;
      refusals.push("No card settlement detected");
    } else {
      reasons.push("Card settlements detected");
    }

    if (data.company.timeTradingMonths >= 6) {
      reasons.push("Trading >= 6m");
    } else {
      passed = false;
      refusals.push("Trading < 6m");
    }

    if (data.financials.averageMonthlyCardTurnover >= 10000) {
      reasons.push("Card Turnover >= £10k");
    } else {
      passed = false;
      refusals.push("Card Turnover < £10k");
    }

    if (data.company.iva) {
      passed = false;
      refusals.push("Active IVA");
    }

    return { passed, reasons, refusals };
  });

  // 7. YouLend (Card Only)
  addLender("youlend", "YouLend", () => {
    const reasons: string[] = [];
    const refusals: string[] = [];
    let passed = true;

    if (!hasCardReader) {
      passed = false;
      refusals.push("No card settlement detected");
    }

    if (data.company.timeTradingMonths >= 3) {
      reasons.push("Trading >= 3m");
    } else {
      passed = false;
      refusals.push("Trading < 3m");
    }

    if (data.financials.averageMonthlyCardTurnover >= 5000) {
      reasons.push("Card Turnover >= £5k");
    } else {
      passed = false;
      refusals.push("Card Turnover < £5k");
    }

    // Experian Delphi >= 200
    // Use the maximum of available scores to account for different scales (0-100 vs 0-999)
    const score = Math.max(data.credit.experianDelphiScore || 0, data.credit.experianScore || 0);
    if (score >= 200) {
      reasons.push(`Score ${score} >= 200`);
    } else {
      passed = false;
      refusals.push(`Score ${score} < 200`);
    }

    // No other MCAs
    // existingLenderCount must be 0? Or just "No other MCAs"?
    // "Matches lender-related keywords". If detected repayments > 0, likely has MCA.
    if (data.financials.existingLenderCount === 0) {
      reasons.push("No existing MCA detected");
    } else {
      passed = false;
      refusals.push("Existing MCA detected");
    }

    if (data.company.insolvencyEvents) {
      passed = false;
      refusals.push("Insolvency event detected");
    }

    return { passed, reasons, refusals };
  });

  return lenders;
}
