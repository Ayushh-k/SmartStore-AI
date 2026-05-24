// backend/utils/mailer.js

import { transporter } from "../config/mail.js";

/**
 * Sends a premium "Luxury Store Editorial" HTML confirmation email for a completed order.
 * @param {string} userEmail Recipient's email address
 * @param {string} userName Recipient's name
 * @param {object} order Order document from Database
 */
export const sendOrderConfirmationEmail = async (userEmail, userName, order) => {

  // Calculate items count
  const itemsCount = order.products?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;

  // Build order items table rows
  const itemRows = (order.products || []).map((item) => {
    const productName = item.product?.name || "Premium Product";
    const sizeInfo = item.selectedSize ? `Size: ${item.selectedSize}` : "";
    const colorInfo = item.selectedColor ? `Color: ${item.selectedColor}` : "";
    const variationText = [sizeInfo, colorInfo].filter(Boolean).join(" | ");

    return `
      <tr style="border-bottom: 1px solid #e5e5e5;">
        <td style="padding: 16px 0; text-align: left; vertical-align: top;">
          <div style="font-family: 'Times New Roman', Times, serif; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #000000; margin-bottom: 4px;">
            ${productName}
          </div>
          ${variationText ? `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #666666;">${variationText}</div>` : ""}
        </td>
        <td style="padding: 16px 0; text-align: center; vertical-align: top; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #000000;">
          ${item.quantity}
        </td>
        <td style="padding: 16px 0; text-align: right; vertical-align: top; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; color: #000000;">
          $${(item.priceAtPurchase * item.quantity).toFixed(2)}
        </td>
      </tr>
    `;
  }).join("");

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Luxury Editorial HTML layout
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafaf9; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafaf9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card Container with 0px sharp edges and thin border -->
        <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e5e5; border-collapse: collapse; padding: 48px; text-align: left;">
          
          <!-- Header Logo / Brand -->
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

          <!-- Welcome Message -->
          <tr>
            <td style="padding: 40px 40px 0 40px;">
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase; color: #d4af37; margin-bottom: 12px;">
                ORDER CONFIRMED
              </div>
              <h2 style="font-family: 'Times New Roman', Times, serif; font-size: 22px; font-weight: 300; letter-spacing: 0.05em; text-transform: uppercase; margin: 0 0 16px 0; color: #000000; line-height: 1.3;">
                Thank you for your purchase, ${userName}.
              </h2>
              <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 300; line-height: 1.6; color: #555555; margin: 0 0 32px 0;">
                Your request has been validated by our catalog system. We are preparing your curated essentials for immediate express shipping.
              </p>
            </td>
          </tr>

          <!-- Order Summary Fields -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #555555; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f3f3; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px;">Order ID</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f3f3; text-align: right; font-family: monospace; font-size: 12px; font-weight: bold; color: #000000;">${order._id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f3f3; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px;">Date</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f3f3; text-align: right; color: #000000;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f3f3; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px;">Payment Status</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f3f3; text-align: right; color: #22c55e; font-weight: bold; text-transform: uppercase;">${order.paymentDetails?.status || "Paid"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f3f3; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px;">Shipping Method</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f3f3; text-align: right; color: #000000; text-transform: uppercase;">Free Express Shipping</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 0.25em; text-transform: uppercase; color: #000000; margin-bottom: 8px; border-bottom: 2px solid #000000; padding-bottom: 8px;">
                Review Items (${itemsCount})
              </div>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 1px solid #000000;">
                    <th style="padding: 8px 0; text-align: left; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #666666;">Item</th>
                    <th style="padding: 8px 0; text-align: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #666666; width: 60px;">Qty</th>
                    <th style="padding: 8px 0; text-align: right; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #666666; width: 100px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Total Calculation -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="50%" align="right" border="0" cellspacing="0" cellpadding="0" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #555555;">
                <tr>
                  <td style="padding: 6px 0; text-align: left;">Subtotal</td>
                  <td style="padding: 6px 0; text-align: right; color: #000000; font-weight: bold;">$${order.totalAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; text-align: left;">Shipping</td>
                  <td style="padding: 6px 0; text-align: right; color: #22c55e; font-weight: bold; text-transform: uppercase;">Free</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; text-align: left;">Tax</td>
                  <td style="padding: 6px 0; text-align: right; color: #000000;">$0.00</td>
                </tr>
                <tr style="border-top: 1px solid #000000;">
                  <td style="padding: 12px 0 0 0; text-align: left; font-size: 13px; font-weight: bold; color: #000000; text-transform: uppercase; letter-spacing: 0.05em;">Total Due</td>
                  <td style="padding: 12px 0 0 0; text-align: right; font-size: 14px; font-weight: bold; color: #000000;">$${order.totalAmount.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tracking Link Link -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <div style="margin-top: 10px;">
                <a href="${process.env.CLIENTURL || 'http://localhost:5173'}/profile" style="display: inline-block; background-color: #000000; color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; text-decoration: none; text-transform: uppercase; letter-spacing: 0.15em; padding: 14px 28px; border: 1px solid #000000;">
                  Track Order In Profile
                </a>
              </div>
            </td>
          </tr>

          <!-- Shipping Destination -->
          ${order.shippingAddress ? `
          <tr>
            <td style="padding: 0 40px 40px 40px; border-top: 1px solid #e5e5e5; padding-top: 32px;">
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 0.25em; text-transform: uppercase; color: #000000; margin-bottom: 12px;">
                Shipping Destination
              </div>
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6; color: #555555; text-transform: uppercase; letter-spacing: 0.05em;">
                <strong>Street:</strong> ${order.shippingAddress.street}<br>
                <strong>City/State:</strong> ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}<br>
                <strong>Country:</strong> ${order.shippingAddress.country}
              </div>
            </td>
          </tr>
          ` : ""}

          <!-- Footer Copyright Notice -->
          <tr>
            <td style="padding: 32px 40px; background-color: #fafaf9; border-top: 1px solid #e5e5e5; text-align: center;">
              <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #999999; margin: 0 0 8px 0; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} SmartStore. All Rights Reserved.
              </p>
              <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #999999; margin: 0;">
                Designed with high-contrast luxury aesthetics.
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

  const mailOptions = {
    from: `"SmartStore Atelier" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Order Confirmation - Order #${order._id}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent successfully to", userEmail);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
};
