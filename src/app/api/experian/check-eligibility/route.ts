
import { NextResponse } from "next/server";
import { checkCompanyCredit, searchExperianDirector, getExperianDirectorDetails } from "@/lib/experian";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyNumber, directorName } = body;

    if (!companyNumber) {
      return NextResponse.json(
        { error: "Company number is required" },
        { status: 400 }
      );
    }

    // 1. Check Company Credit
    // FORCE SANDBOX ID: "99999999" works in Experian Sandbox
    const startLog = `Checking Experian Sandbox for Company: 99999999 (Input was: ${companyNumber})`;
    console.log(startLog);
    const companyCreditData = await checkCompanyCredit("99999999");

    // 2. Check Director Credit (if name provided)
    let directorCreditData = null;
    if (directorName) {
      // FORCE SANDBOX DIRECTOR ID: "D99999999" works in Experian Sandbox
      console.log(`Checking Experian Sandbox for Director: D99999999 (Input was: ${directorName})`);
      directorCreditData = await getExperianDirectorDetails("D99999999");

      // Original logic preserved in comments for future production use:
      /*
      const parts = directorName.trim().split(" ");
      const lastName = parts.pop() || "";
      const firstName = parts.join(" ");
      if (firstName && lastName) {
        const searchResult = await searchExperianDirector(firstName, lastName);
        if (searchResult && Array.isArray(searchResult.items)) {
           const directorId = searchResult.items[0]?.directorNumber;
           if (directorId) {
             directorCreditData = await getExperianDirectorDetails(directorId);
           }
        }
      }
      */
    }

    return NextResponse.json({
      company: companyCreditData, // Contains { raw, summary }
      director: directorCreditData
    });
  } catch (error: any) {
    console.error("Error in check-eligibility route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check eligibility" },
      { status: 500 }
    );
  }
}
