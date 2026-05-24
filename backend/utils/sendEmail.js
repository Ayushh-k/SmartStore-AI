// backend/utils/sendEmail.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Sends an email using the Brevo (Sendinblue) HTTP API.
 * @param {object} params Email parameters
 * @param {string} params.to Recipient email address
 * @param {string} params.subject Email subject line
 * @param {string} params.htmlContent HTML content of the email
 */
export const sendEmail = async ({ to, subject, htmlContent }) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_USER || "ayushkamboj9690@gmail.com";

  if (!brevoApiKey) {
    console.warn("⚠️ BREVO_API_KEY environment variable not configured. Skipping email dispatch.");
    return;
  }

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "SmartStore AI", email: senderEmail },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
        },
      }
    );

    console.log(`[BREVO METRICS] Email successfully sent to ${to}. Message ID:`, response.data?.messageId);
    return response.data;
  } catch (error) {
    console.error("❌ Brevo HTTP SMTP Dispatch Error:");
    if (error.response) {
      console.error("HTTP Status Code:", error.response.status);
      console.error("Response Data Details:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    // We do not throw the error to prevent API crashes in checkout or other flows
  }
};
