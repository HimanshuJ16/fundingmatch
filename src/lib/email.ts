import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type Attachment = {
  filename?: string | false;
  content?: Buffer | string;
  contentType?: string;
  path?: string;
  contentId?: string;
};

type SendEmailArgs = {
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  from?: string;
  attachments?: Attachment[];
};

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  from,
  attachments,
}: SendEmailArgs) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }

  const sender = from || "Funding Match <les@fundingmatch.ai>";

  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to,
      subject,
      html: html ?? "",
      text: text ?? "",
      replyTo: replyTo,
      attachments,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (err: any) {
    console.error("Failed to send email:", err);
    throw new Error(err.message || "Failed to send email");
  }
}