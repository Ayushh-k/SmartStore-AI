import { sendEmail } from "../utils/sendEmail.js";

/**
 * Handles dual-route contact form submission.
 * Route A: Technical alert notification to Super Admin.
 * Route B: Formal receipt confirmation to the User.
 */
export const handleContactSubmit = async (req, res) => {
  try {
    const { email: userEmail, message } = req.body;

    if (!userEmail || !message) {
      return res.status(400).json({ message: "Email and message are required." });
    }

    const timestamp = new Date().toLocaleString("en-US", { timeZoneName: "short" });

    // Route A Template: Internal Technical layout
    const adminHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Platform Issue Log</title>
      </head>
      <body style="margin:0; padding: 40px 20px; background-color: #fafaf9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000000;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafaf9;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e5e5; padding: 40px; text-align: left;">
                <tr>
                  <td style="padding-bottom: 24px; border-bottom: 1px solid #e5e5e5;">
                    <h2 style="font-family: 'Times New Roman', Times, serif; font-size: 20px; font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;">
                      [PLATFORM ISSUE LOG]
                    </h2>
                    <span style="font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.15em; color: #666666;">
                      Storefront Ticket Received
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 30px; font-size: 12px; line-height: 1.6; color: #333333;">
                    <p style="margin: 0 0 10px 0;"><strong>Sender Account:</strong> ${userEmail}</p>
                    <p style="margin: 0 0 20px 0;"><strong>Logged Timestamp:</strong> ${timestamp}</p>
                    
                    <div style="border: 1px solid #000000; padding: 20px; margin-top: 15px; background-color: #ffffff; font-family: monospace; font-size: 11px; white-space: pre-wrap; color: #000000;">
${message}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 40px; text-align: center; border-top: 1px solid #e5e5e5; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #999999;">
                    SmartStore Platform Administration Services
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Route B Template: Customer service ticket acknowledgement
    const userHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket Received</title>
      </head>
      <body style="margin:0; padding:0; background-color: #fafaf9;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafaf9; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e5e5; border-collapse: collapse; padding: 48px; text-align: left;">
                
                <!-- Logo -->
                <tr>
                  <td style="padding: 40px 40px 24px 40px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                    <h1 style="font-family: 'Times New Roman', Times, serif; font-size: 26px; font-weight: 300; letter-spacing: 0.3em; text-transform: uppercase; margin: 0; color: #000000; display: inline-block;">
                      SmartStore
                    </h1>
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9px; letter-spacing: 0.4em; text-transform: uppercase; color: #666666; margin-top: 8px; font-weight: 400;">
                      Atelier AI Catalog
                    </div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 40px 32px 40px;">
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase; color: #d4af37; margin-bottom: 12px;">
                      INQUIRY ACKNOWLEDGEMENT
                    </div>
                    <h2 style="font-family: 'Times New Roman', Times, serif; font-size: 22px; font-weight: 300; letter-spacing: 0.05em; text-transform: uppercase; margin: 0 0 16px 0; color: #000000; line-height: 1.3;">
                      Ticket Received
                    </h2>
                    <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 300; line-height: 1.6; color: #555555; margin: 0 0 20px 0;">
                      Thank you for contacting us. Our platform development and support team has successfully logged your ticket request.
                    </p>
                    <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 300; line-height: 1.6; color: #555555; margin: 0 0 20px 0;">
                      We are currently reviewing your logged inquiry details. A representative will contact you via this email address as soon as possible.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 32px 40px; background-color: #fafaf9; border-top: 1px solid #e5e5e5; text-align: center;">
                    <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #999999; margin: 0 0 8px 0; line-height: 1.5;">
                      &copy; ${new Date().getFullYear()} SmartStore. All Rights Reserved.
                    </p>
                    <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #999999; margin: 0;">
                      Support ticket tracking ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const adminMailOptions = {
      from: `"SmartStore Platform Issue Service" <${process.env.EMAIL_USER || "ayushkamboj9690@gmail.com"}>`,
      to: "ayushkamboj9690@gmail.com",
      subject: `[PLATFORM ISSUE LOG] - Storefront Ticket from ${userEmail}`,
      html: adminHtml,
    };

    const userMailOptions = {
      from: `"SmartStore Customer Care" <${process.env.EMAIL_USER || "ayushkamboj9690@gmail.com"}>`,
      to: userEmail,
      subject: "We have received your request — SMARTSTORE",
      html: userHtml,
    };

    // Execute both asynchronously using Promise.all
    await Promise.all([
      sendEmail({
        to: process.env.EMAIL_USER || "ayushkamboj9690@gmail.com",
        subject: `[PLATFORM ISSUE LOG] - Storefront Ticket from ${userEmail}`,
        htmlContent: adminHtml,
      }),
      sendEmail({
        to: userEmail,
        subject: "We have received your request — SMARTSTORE",
        htmlContent: userHtml,
      }),
    ]);

    console.log(`[CONTACT METRICS] Successfully processed storefront ticket from ${userEmail}`);

    res.status(200).json({
      success: true,
      message: "Ticket submitted successfully and email receipts dispatched.",
    });

  } catch (error) {
    console.error("Dual contact routing error:", error);
    res.status(500).json({ message: "Failed to dispatch contact notifications. Server error." });
  }
};
