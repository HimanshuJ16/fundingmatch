
interface ExperianAuthResponse {
  issued_at: string;
  expires_in: string;
  token_type: string;
  access_token: string;
  refresh_token: string;
}

const EXPERIAN_BASE_URL = "https://sandbox-uk-api.experian.com";

export async function getExperianAccessToken(): Promise<string> {
  const response = await fetch(`${EXPERIAN_BASE_URL}/oauth2/v1/token`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: process.env.EXPERIAN_USERNAME,
      password: process.env.EXPERIAN_PASSWORD,
      client_id: process.env.EXPERIAN_CLIENT_ID,
      client_secret: process.env.EXPERIAN_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Experian Auth Error:", errorText);
    throw new Error(`Failed to authenticate with Experian: ${response.statusText}`);
  }

  const data: ExperianAuthResponse = await response.json();
  return data.access_token;
}


export interface ExperianCompanySummary {
  registrationNumber: string;
  companyName: string;
  companyStatus: string; // [New]
  incorporationDate: string;
  sicCodes: { code: string; description: string }[];
  commercialDelphiScore: number; // Renamed from creditScore
  commercialBand: string; // Renamed from creditBand
  creditLimit: number;
  creditRating: number;
  latestTurnover: number | null;
  latestNetWorth: number | null;
  accountsDate: string | null;
  // New Fields
  ccjCount: number;
  ccjValue: number;
  mortgageCount: number;
  legalNoticesCount: number;
  cifasCount: number;
  caisBalance: number;
  // Management Info
  directors: ExperianOfficer[];
  secretaries: ExperianOfficer[];
}

export interface ExperianOfficer {
  name: string;
  number: string;
  nationality?: string;
  numberOfConvictions?: number;
  role: 'Director' | 'Secretary';
}

export async function checkCompanyCredit(companyNumber: string) {
  try {
    const token = await getExperianAccessToken();

    // v2/registeredcompanycredit/{RegNumber}
    const response = await fetch(
      `${EXPERIAN_BASE_URL}/risk/business/v2/registeredcompanycredit/${companyNumber}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Experian Sandbox: Company ${companyNumber} not found.`);
        return { error: "Company not found", mock: true };
      }

      const errorText = await response.text();
      console.error(`Experian Credit Check Error: Status ${response.status} - ${response.statusText}`);
      console.error("Error Details:", errorText);
      throw new Error(`Failed to fetch credit data: ${response.statusText} - ${errorText}`);
    }

    const rawData = await response.json();
    console.log("Experian Credit Check Response (Summary Extraction)...");

    const summary = parseExperianCompanyData(rawData);

    console.log("Summary:", summary);

    return {
      raw: rawData,
      summary: summary
    };

  } catch (error) {
    console.error("Experian API Error:", error);
    throw error;
  }
}

function parseExperianCompanyData(data: any): ExperianCompanySummary {
  // Safe extraction helper
  const get = (path: string[], fallback: any = null) => {
    let current = data;
    for (const key of path) {
      if (current === null || current === undefined || typeof current !== 'object') return fallback;
      current = current[key];
    }
    return current !== undefined ? current : fallback;
  };

  // Extract SIC codes
  const sicInfo = get(['Identification', 'SICInformation1992'], []) as any[];
  const sicCodes = sicInfo.map(sic => ({
    code: sic.Code,
    description: sic.Description
  }));

  // Extract Financials (Latest Accounts)
  const latestAccounts = get(['Financials', 'Accounts', '0'], null);
  let latestTurnover = null;
  let latestNetWorth = null;
  let accountsDate = null;

  if (latestAccounts) {
    latestTurnover = parseInt(get(['Financials', 'Accounts', '0', 'ProfitLoss', 'TurnoverSalesDetails', 'TurnoverSales'], '0'));
    latestNetWorth = parseInt(get(['Financials', 'Accounts', '0', 'BalanceSheet', 'NetWorth'], '0'));
    accountsDate = get(['Financials', 'Accounts', '0', 'DateOfAccounts'], null);
  }

  // CAIS Extraction
  const caisPortfolios = get(['LimitedCompanyCAISPortfolioSummary'], []) as any[];
  let caisBalance = 0;
  caisPortfolios.forEach(portfolio => {
    // Assuming MonthlyData[0] is the latest month
    const latestMonth = portfolio.MonthlyData && portfolio.MonthlyData.length > 0 ? portfolio.MonthlyData[0] : null;
    if (latestMonth && latestMonth.CurrentBalance) {
      caisBalance += parseInt(latestMonth.CurrentBalance, 10) || 0;
    }
  });

  // Extract Directors
  const currentDirectors = get(['ManagementInfo', 'Directors', 'CurrentDirector'], []) as any[];
  const directors: ExperianOfficer[] = currentDirectors.map((d: any) => {
    const details = d.DirectorDetails || {};
    const nameObj = details.Name || {};
    const fullName = [nameObj.Forename, nameObj.MiddleNames, nameObj.Surname].filter(Boolean).join(' ');

    return {
      name: fullName,
      number: d.DirectorNumber || '',
      nationality: details.Nationality,
      numberOfConvictions: d.NumberConvictions ? parseInt(d.NumberConvictions, 10) : 0,
      role: 'Director'
    };
  });

  // Extract Secretaries
  const currentSecretaries = get(['ManagementInfo', 'Secretaries', 'CurrentSecretary'], []) as any[];
  const secretaries: ExperianOfficer[] = currentSecretaries.map((s: any) => {
    const details = s.SecretaryDetails || {};
    const nameObj = details.Name || {};
    const fullName = [nameObj.Forename, nameObj.MiddleNames, nameObj.Surname].filter(Boolean).join(' ');

    return {
      name: fullName,
      number: s.DirectorNumber || '',
      nationality: details.Nationality,
      numberOfConvictions: s.NumberConvictions ? parseInt(s.NumberConvictions, 10) : undefined,
      role: 'Secretary'
    };
  });

  return {
    registrationNumber: get(['RegNumber'], ''),
    companyName: get(['CommercialName'], ''),
    companyStatus: get(['CurrentStatus'], 'Active'), // Default to Active if missing
    incorporationDate: get(['Identification', 'IncorporationDate'], ''),
    sicCodes: sicCodes,
    commercialDelphiScore: parseInt(get(['CommercialDelphi', 'CommDelphiScore'], '0')),
    commercialBand: get(['CommercialDelphi', 'CommDelphiBandText'], ''),
    creditLimit: parseInt(get(['CommercialDelphi', 'CreditLimit'], '0')),
    creditRating: parseInt(get(['CommercialDelphi', 'CreditRating'], '0')),
    latestTurnover: latestTurnover,
    latestNetWorth: latestNetWorth,
    accountsDate: accountsDate,

    // New Fields Extraction
    ccjCount: parseInt(get(['CCJs', 'NumberCCJsLast12Months'], '0')),
    ccjValue: parseInt(get(['CCJs', 'ValueCCJsLast12Months'], '0')),
    mortgageCount: parseInt(get(['Mortgages', 'NumMortgages'], '0')),
    legalNoticesCount: parseInt(get(['LegalNotices', 'NumLegalNotices'], '0')),
    cifasCount: parseInt(get(['DirectorExpandedSummary', '0', 'NumCIFAS'], '0')),
    caisBalance: caisBalance,
    directors: directors,
    secretaries: secretaries
  };
}

export async function searchExperianDirector(firstName: string, lastName: string) {
  try {
    const token = await getExperianAccessToken();
    const cleanFirstName = firstName.replace(/[^a-zA-Z0-9\- ']/g, '').trim();
    const cleanLastName = lastName.replace(/[^a-zA-Z0-9\- ']/g, '').trim();



    const response = await fetch(
      `${EXPERIAN_BASE_URL}/risk/business/v2/directortargeter?forename=${encodeURIComponent(cleanFirstName)}&surname=${encodeURIComponent(cleanLastName)}&directorsflag=true&secretariesflag=false`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Fallback for demo if real API returns nothing
        return { items: [], mock: true };
      }
      const errorText = await response.text();
      throw new Error(`Failed to search director: ${response.statusText} - ${errorText}`);
    }

    console.log("Experian Director Search Response:", response);

    return await response.json();
  } catch (error) {
    console.error("Experian Director Search Error:", error);
    // Return empty mock for demo if completely failed
    return { items: [], mock: true, error: String(error) };
  }
}

export interface ExperianDirectorDetailedSummary {
  directorId: string;
  personalInfo: {
    forename: string;
    middleNames?: string;
    surname: string;
    dateOfBirth?: string;
    nationality?: string;
  };
  homeAddress: {
    houseName?: string;
    houseNumber?: string;
    street?: string;
    district?: string;
    town?: string;
    postcode?: string;
  };
  currentDirectorships: {
    companyName: string;
    registrationNumber: string;
    appointmentDate?: string;
    role?: string;
  }[];
  previousDirectorships: {
    companyName: string;
    registrationNumber: string;
    resignationDate?: string;
  }[];
  adverse: {
    commitedCount: number; // Convictions
    cifasCount: number;    // Fraud
    disqualified: boolean;
    disqualStartDate?: string;
    disqualEndDate?: string;
  };
  personalCreditScore?: number | null;
}

function parseExperianDirectorData(data: any): ExperianDirectorDetailedSummary {
  const get = (path: string[], fallback: any = null) => {
    let current = data;
    for (const key of path) {
      if (current === null || current === undefined || typeof current !== 'object') return fallback;
      current = current[key];
    }
    return current !== undefined ? current : fallback;
  };

  const details = get(['DirectorDetails'], {});
  const name = details.Name || {};
  const location = details.Location || {};

  // Directorships
  const currentDirs = get(['Directorships', 'CurrentDirector'], []) as any[];
  const prevDirs = get(['Directorships', 'PreviousDirector'], []) as any[];

  // Adverse
  const convictions = get(['Convictions', '0'], {}); // Assuming first object has summary
  const cifas = get(['SummaryDirectorCIFAS', '0'], {});

  return {
    directorId: get(['DirectorNumber'], ''),
    personalInfo: {
      forename: name.Forename || '',
      middleNames: name.MiddleNames,
      surname: name.Surname || '',
      dateOfBirth: details.DateOfBirth,
      nationality: details.Nationality
    },
    homeAddress: {
      houseName: location.HouseName,
      houseNumber: location.HouseNumber,
      street: location.Street,
      district: location.District,
      town: location.PostTown,
      postcode: location.Postcode
    },
    currentDirectorships: currentDirs.map((d: any) => ({
      companyName: d.CommercialDetail?.Name || '',
      registrationNumber: d.CommercialDetail?.RegNumber || '',
      appointmentDate: d.AppointmentDate,
      role: d.Position
    })),
    previousDirectorships: prevDirs.map((d: any) => ({
      companyName: d.CommercialDetail?.Name || '',
      registrationNumber: d.CommercialDetail?.RegNumber || '',
      resignationDate: d.ResignationDate
    })),
    adverse: {
      commitedCount: parseInt(convictions.NumConvictions || '0', 10),
      cifasCount: parseInt(cifas.NumCifasRecs || '0', 10),
      disqualified: !!get(['DisqualStartDate'], null),
      disqualStartDate: get(['DisqualStartDate'], undefined),
      disqualEndDate: get(['DisqualEndDate'], undefined)
    }
  };
}

// [New] Delphi Select (Consumer) API Integration
export async function checkConsumerCredit(director: ExperianDirectorDetailedSummary): Promise<number | null> {
  const token = await getExperianAccessToken();

  // Map Director Summary to Delphi Select Input
  const payload = {
    Submission: {
      Application: {
        ApplicationType: "QL", // Personal Loan Quotation (Soft Search)
        ProductCode: "DelphiSelect"
      },
      Applicants: [
        {
          ApplicantIdentifier: 1,
          Person: {
            PersonIdentifier: 1,
            Name: {
              Forename: director.personalInfo.forename,
              Surname: director.personalInfo.surname,
              Title: "Mr" // Simplification: Title is often required; could derive or omit if optional
            },
            DateOfBirth: director.personalInfo.dateOfBirth
          },
          ApplicantData: {
            ApplicantIdentifier: 1
          }
        }
      ],
      Locations: [
        {
          LocationIdentifier: 1,
          UKLocation: {
            HouseNumber: director.homeAddress.houseNumber?.substring(0, 10),
            HouseName: director.homeAddress.houseName?.substring(0, 50),
            Street: director.homeAddress.street?.substring(0, 60),
            Postcode: director.homeAddress.postcode?.replace(/\s+/g, ''),
            PostTown: director.homeAddress.town
          }
        }
      ],
      Residencies: [
        {
          LocationIdentifier: 1,
          ApplicantIdentifier: 1,
          ResidencyDateFrom: "2020-01-01", // Placeholder, usually required
          ResidencyType: "O" // Owner
        }
      ],
      Options: {
        ProductCode: "DelphiSelect",
        TestDatabase: "A" // Sandbox specific
      }
    }
  };

  try {
    const response = await fetch(
      `${EXPERIAN_BASE_URL}/risk/consumer/v2/dataselect/application`,
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Consumer API Error:", text);
      return null;
    }

    const data = await response.json();

    // Path: Response.ConsumerSummary.PremiumValueData.Scoring.E5S051 (Observed in Sandbox)
    let score = data.Response?.ConsumerSummary?.PremiumValueData?.Scoring?.E5S051;

    if (score === undefined) {
      // Fallback paths
      score = data.Submission?.Applicants?.[0]?.ApplicantData?.Score?.DelphiScore;
    }

    return typeof score === 'number' ? score : null;

  } catch (e) {
    console.error("Consumer Exception:", e);
    return null;
  }
}

export async function getExperianDirectorDetails(directorId: string) {
  try {
    const token = await getExperianAccessToken();
    const response = await fetch(
      `${EXPERIAN_BASE_URL}/risk/business/v2/directordetails/${directorId}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Experian Director Details Error:", errorText);
      throw new Error(`Failed to get director details: ${response.statusText}`);
    }

    const rawData = await response.json();
    console.log("Experian Director Details Raw Data (Summary Extraction)...");

    const summary = parseExperianDirectorData(rawData);

    // [New] Check Personal Credit Score if we have address and DOB
    let personalCreditScore = null;
    if (summary.personalInfo.dateOfBirth && summary.homeAddress.postcode) {
      console.log("Checking Personal Credit Score for Director...");
      try {
        personalCreditScore = await checkConsumerCredit(summary);
        console.log("Personal Credit Score:", personalCreditScore);
      } catch (err) {
        console.error("Failed to check personal credit:", err);
      }
    }

    return {
      raw: rawData,
      summary: {
        ...summary,
        personalCreditScore
      }
    };
  } catch (error) {
    console.error("Experian Director Details Error:", error);
    throw error;
  }
}
