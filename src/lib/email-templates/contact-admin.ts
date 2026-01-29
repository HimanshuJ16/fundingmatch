export type ContactFormData = {
  name: string;
  companyName: string;
  email: string;
  phone: string;
};

export function renderContactEmailHTML(data: ContactFormData): string {
  const { name, companyName, email, phone } = data;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>New Contact Request</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #182744; padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">New Contact Request</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="margin: 0; color: #52525b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Full Name</p>
                    <p style="margin: 5px 0 0; color: #18181b; font-size: 16px; line-height: 1.5;">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px; border-top: 1px solid #f4f4f5; padding-top: 20px;">
                    <p style="margin: 0; color: #52525b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Company</p>
                    <p style="margin: 5px 0 0; color: #18181b; font-size: 16px; line-height: 1.5;">${companyName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px; border-top: 1px solid #f4f4f5; padding-top: 20px;">
                    <p style="margin: 0; color: #52525b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Email Address</p>
                    <p style="margin: 5px 0 0; color: #18181b; font-size: 16px; line-height: 1.5;">
                      <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 0px; border-top: 1px solid #f4f4f5; padding-top: 20px;">
                    <p style="margin: 0; color: #52525b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Phone Number</p>
                    <p style="margin: 5px 0 0; color: #18181b; font-size: 16px; line-height: 1.5;">
                      <a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">Sent via Funding Match Contact Form</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}