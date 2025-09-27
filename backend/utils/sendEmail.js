const nodemailer = require('nodemailer');
const fs = require('fs');
require('dotenv').config();

const sendEmail = async (to, subject, text, html = null, attachments = []) => {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    ...(html && { html }),
    ...(attachments.length > 0 && { attachments })
  };

  await transporter.sendMail(mailOptions);
};

// Specialized function for sending invoice emails
const sendInvoiceEmail = async (to, orderId, invoiceNumber, filepath, customerName, totalAmount) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1976d2 0%, #dc004e 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="font-size: 32px; margin: 0;">BrandsRkhan</h1>
        <p style="margin: 5px 0; opacity: 0.9;">Premium Quality Products</p>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 8px;">
        <h2>Your Invoice is Ready</h2>
        <p>Dear ${customerName || 'Valued Customer'},</p>
        <p>Please find attached your invoice for order #${orderId}.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Invoice Details</h3>
          <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> PKR ${totalAmount}</p>
          <p><strong>Payment Status:</strong> <span style="color: #388e3c; font-weight: bold;">Confirmed</span></p>
        </div>

        <p>Thank you for choosing BrandsRkhan. We appreciate your business!</p>
      </div>
      
      <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p><strong>BrandsRkhan</strong></p>
        <p>Main Boulevard, Gulberg III<br>Lahore, Punjab 54000, Pakistan</p>
        <p>Phone: +92-42-123-4567 | Email: brandrkhanofficial@gmail.com</p>
      </div>
    </div>
  `;

  const textContent = `
Invoice from BrandsRkhan

Dear ${customerName || 'Valued Customer'},

Thank you for your order! Please find your invoice attached.

Order Details:
- Order ID: ${orderId}
- Invoice Number: ${invoiceNumber}
- Total Amount: PKR ${totalAmount}
- Order Date: ${new Date().toLocaleDateString()}

Thank you for choosing BrandsRkhan - Premium Quality Products.

Best regards,
BrandsRkhan Team
  `;

  const attachments = [{
    filename: `invoice-${orderId}.pdf`,
    path: filepath
  }];

  await sendEmail(to, `Invoice from BrandsRkhan - Order #${orderId}`, textContent, htmlContent, attachments);
};

// Professional welcome email
const sendWelcomeEmail = async (to, name) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8f9fa; border-radius: 8px;">
      <div style="background: #fff; padding: 32px 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
        <h1 style="color: #1976d2; text-align: center; margin-bottom: 16px;">Welcome to BrandsRkhan!</h1>
        <p style="font-size: 18px; color: #333; margin-bottom: 24px; text-align: center;">Hi <b>${name}</b>,</p>
        <p style="font-size: 16px; color: #444; margin-bottom: 18px;">Thank you for registering with <b>BrandsRkhan</b>! We are thrilled to have you join our premium products community.</p>
        <p style="font-size: 16px; color: #444; margin-bottom: 18px;">If you have any questions, our support team is here to help.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://brandsrkhan.com" style="background: #1976d2; color: #fff; padding: 12px 32px; border-radius: 4px; text-decoration: none; font-size: 16px;">Start Shopping</a>
        </div>
        <p style="font-size: 15px; color: #888; text-align: center;">Thank you for choosing our brand.<br/>Happy shopping!<br/><br/>Best regards,<br/>The BrandsRkhan Team</p>
      </div>
      <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 24px;">This is an automated email. Please do not reply to this message.</p>
    </div>
  `;

  const textContent = `Hi ${name},

Welcome to BrandsRkhan! We are thrilled to have you join our premium products community.

If you have any questions, our support team is here to help.

Thank you for choosing our brand.
Happy shopping!

Best regards,
The BrandsRkhan Team`;

  await sendEmail(
    to,
    'Welcome to BrandsRkhan!',
    textContent,
    htmlContent
  );
};

// Send offer expiry alert to admin
async function sendOfferExpiryAlert(adminEmail, offer) {
  const subject = `Offer Expiry Alert: ${offer.name}`;
  const text = `The offer "${offer.name}" is expiring soon (ends at ${offer.endDate}).`;
  const html = `<p>The offer <strong>${offer.name}</strong> is expiring soon (ends at <strong>${offer.endDate}</strong>).</p>`;
  await sendEmail(adminEmail, subject, text, html);
}

module.exports = { sendEmail, sendInvoiceEmail, sendWelcomeEmail, sendOfferExpiryAlert };