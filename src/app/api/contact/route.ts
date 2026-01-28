import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { renderContactEmailHTML } from "@/lib/email-renderer";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, companyName, email, phone } = body;

    // Validate input
    if (!name || !companyName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save to database
    try {
      await prisma.contactRequest.create({
        data: {
          name,
          companyName,
          email,
          phone,
        },
      });
    } catch (dbError) {
      console.error("Failed to save contact request to database:", dbError);
    }

    const html = renderContactEmailHTML({ name, companyName, email, phone });
    const text = `New Contact Request\n\nName: ${name}\nCompany: ${companyName}\nEmail: ${email}\nPhone: ${phone}`;

    await sendEmail({
      to: ["les@fundingmatch.ai"],
      subject: `New Contact Request | ${name} from ${companyName}`,
      html,
      text,
      replyTo: email,
      from: "Funding Match <les@fundingmatch.ai>",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
