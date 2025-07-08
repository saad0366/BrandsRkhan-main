const nodemailer = require('nodemailer');
const fs = require('fs');
require('dotenv').config();

const sendEmail = async (to, subject, text, html = null, attachments = []) => {
  const transporter = nodemailer.createTransport({
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
const sendInvoiceEmail = async (to, orderId, invoiceNumber, filepath) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #333; margin: 0; text-align: center;">Thank You for Your Order!</h1>
      </div>
      
      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Dear Customer,
        </p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Thank you for placing your order with us! Your order has been successfully processed and confirmed.
        </p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #333; margin: 0 0 10px 0;">Order Details:</h3>
          <p style="margin: 5px 0; color: #666;">
            <strong>Order ID:</strong> ${orderId}
          </p>
          <p style="margin: 5px 0; color: #666;">
            <strong>Invoice Number:</strong> ${invoiceNumber}
          </p>
          <p style="margin: 5px 0; color: #666;">
            <strong>Order Date:</strong> ${new Date().toLocaleDateString()}
          </p>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Please find your detailed invoice attached to this email. You can use this invoice for your records and for any warranty claims.
        </p>
        
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2196f3;">
          <h4 style="color: #1976d2; margin: 0 0 10px 0;">What's Next?</h4>
          <ul style="color: #333; margin: 0; padding-left: 20px;">
            <li>We'll process your order and prepare it for shipping</li>
            <li>You'll receive a shipping confirmation email with tracking details</li>
            <li>Your order will be delivered to your specified address</li>
          </ul>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          If you have any questions about your order, please don't hesitate to contact our customer support team.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">
            Thank you for choosing us!
          </p>
          <p style="color: #999; font-size: 12px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    </div>
  `;

  const textContent = `
Thank You for Your Order!

Dear Customer,

Thank you for placing your order with us! Your order has been successfully processed and confirmed.

Order Details:
- Order ID: ${orderId}
- Invoice Number: ${invoiceNumber}
- Order Date: ${new Date().toLocaleDateString()}

Please find your detailed invoice attached to this email. You can use this invoice for your records and for any warranty claims.

What's Next?
- We'll process your order and prepare it for shipping
- You'll receive a shipping confirmation email with tracking details
- Your order will be delivered to your specified address

If you have any questions about your order, please don't hesitate to contact our customer support team.

Thank you for choosing us!

This is an automated email. Please do not reply to this message.
  `;

  const attachments = [{
    filename: `invoice-${orderId}.pdf`,
    path: filepath
  }];

  await sendEmail(to, `Your Invoice for Order #${orderId}`, textContent, htmlContent, attachments);
};

// Professional welcome email
const sendWelcomeEmail = async (to, name) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8f9fa; border-radius: 8px;">
      <div style="background: #fff; padding: 32px 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
        <h1 style="color: #1976d2; text-align: center; margin-bottom: 16px;">Welcome to Brands-R-khan!</h1>
        <p style="font-size: 18px; color: #333; margin-bottom: 24px; text-align: center;">Hi <b>${name}</b>,</p>
        <p style="font-size: 16px; color: #444; margin-bottom: 18px;">Thank you for registering with <b>Brands-R-khan</b>! We are thrilled to have you join our luxury watch community.</p>
        <ul style="font-size: 15px; color: #555; margin-bottom: 18px;">
          <li>Explore our premium collection of watches</li>
          <li>Enjoy exclusive member offers and early access to new arrivals</li>
          <li>Experience the best in quality and service</li>
        </ul>
        <p style="font-size: 16px; color: #444; margin-bottom: 18px;">If you have any questions, our support team is here to help.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://brandsrkhan.com" style="background: #1976d2; color: #fff; padding: 12px 32px; border-radius: 4px; text-decoration: none; font-size: 16px;">Start Shopping</a>
        </div>
        <p style="font-size: 15px; color: #888; text-align: center;">Thank you for choosing our brand.<br/>Happy shopping!<br/><br/>Best regards,<br/>The Brands-R-khan Team</p>
      </div>
      <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 24px;">This is an automated email. Please do not reply to this message.</p>
    </div>
  `;

  const textContent = `Hi ${name},\n\nWelcome to Brands-R-khan! We are thrilled to have you join our luxury watch community.\n\nExplore our premium collection, enjoy exclusive offers, and experience the best in quality and service.\n\nIf you have any questions, our support team is here to help.\n\nThank you for choosing our brand.\nHappy shopping!\n\nBest regards,\nThe Brands-R-khan Team`;

  await sendEmail(
    to,
    'Welcome to Brands-R-khan!',
    textContent,
    htmlContent
  );
};

// Professional reorder email
const sendReorderEmail = async (to, orderId, invoiceNumber, filepath) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #333; margin: 0; text-align: center;">Reorder Confirmed!</h1>
      </div>
      
      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Dear Customer,
        </p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Great news! Your reorder has been successfully placed and confirmed. We're excited to process your order again!
        </p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #333; margin: 0 0 10px 0;">Reorder Details:</h3>
          <p style="margin: 5px 0; color: #666;">
            <strong>Order ID:</strong> ${orderId}
          </p>
          <p style="margin: 5px 0; color: #666;">
            <strong>Invoice Number:</strong> ${invoiceNumber}
          </p>
          <p style="margin: 5px 0; color: #666;">
            <strong>Order Date:</strong> ${new Date().toLocaleDateString()}
          </p>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Please find your detailed invoice attached to this email. You can use this invoice for your records and for any warranty claims.
        </p>
        
        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <h4 style="color: #2e7d32; margin: 0 0 10px 0;">What's Next?</h4>
          <ul style="color: #333; margin: 0; padding-left: 20px;">
            <li>We'll process your reorder and prepare it for shipping</li>
            <li>You'll receive a shipping confirmation email with tracking details</li>
            <li>Your order will be delivered to your specified address</li>
          </ul>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Thank you for choosing to shop with us again! If you have any questions about your reorder, please don't hesitate to contact our customer support team.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">
            Thank you for your continued trust!
          </p>
          <p style="color: #999; font-size: 12px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    </div>
  `;

  const textContent = `
Reorder Confirmed!

Dear Customer,

Great news! Your reorder has been successfully placed and confirmed. We're excited to process your order again!

Reorder Details:
- Order ID: ${orderId}
- Invoice Number: ${invoiceNumber}
- Order Date: ${new Date().toLocaleDateString()}

Please find your detailed invoice attached to this email. You can use this invoice for your records and for any warranty claims.

What's Next?
- We'll process your reorder and prepare it for shipping
- You'll receive a shipping confirmation email with tracking details
- Your order will be delivered to your specified address

Thank you for choosing to shop with us again! If you have any questions about your reorder, please don't hesitate to contact our customer support team.

Thank you for your continued trust!

This is an automated email. Please do not reply to this message.
  `;

  const attachments = [{
    filename: `invoice-${orderId}.pdf`,
    path: filepath
  }];

  await sendEmail(to, `Your Reorder Confirmation #${orderId}`, textContent, htmlContent, attachments);
};

// Professional order cancellation email
const sendOrderCancellationEmail = async (to, orderId) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ffeaa7;">
        <h1 style="color: #856404; margin: 0; text-align: center;">Order Cancelled</h1>
      </div>
      
      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Dear Customer,
        </p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          We have received your request to cancel your order. Your order has been successfully cancelled as requested.
        </p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #333; margin: 0 0 10px 0;">Cancelled Order Details:</h3>
          <p style="margin: 5px 0; color: #666;">
            <strong>Order ID:</strong> ${orderId}
          </p>
          <p style="margin: 5px 0; color: #666;">
            <strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}
          </p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h4 style="color: #856404; margin: 0 0 10px 0;">Important Information:</h4>
          <ul style="color: #333; margin: 0; padding-left: 20px;">
            <li>If you had already paid for this order, a refund will be processed</li>
            <li>Refunds typically take 3-5 business days to appear in your account</li>
            <li>You can place a new order anytime through your account</li>
          </ul>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          We're sorry to see you go, but we understand that circumstances change. If you change your mind, you can always place a new order with the same items through your account.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">
            We hope to see you again soon!
          </p>
          <p style="color: #999; font-size: 12px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    </div>
  `;

  const textContent = `
Order Cancelled

Dear Customer,

We have received your request to cancel your order. Your order has been successfully cancelled as requested.

Cancelled Order Details:
- Order ID: ${orderId}
- Cancellation Date: ${new Date().toLocaleDateString()}

Important Information:
- If you had already paid for this order, a refund will be processed
- Refunds typically take 3-5 business days to appear in your account
- You can place a new order anytime through your account

We're sorry to see you go, but we understand that circumstances change. If you change your mind, you can always place a new order with the same items through your account.

We hope to see you again soon!

This is an automated email. Please do not reply to this message.
  `;

  await sendEmail(to, `Order Cancelled #${orderId}`, textContent, htmlContent);
};

// Professional reorder confirmation email (separate from invoice email)
const sendReorderConfirmationEmail = async (to, orderId) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #4caf50;">
        <h1 style="color: #2e7d32; margin: 0; text-align: center;">Reorder Confirmed!</h1>
      </div>
      
      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Dear Customer,
        </p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Great news! Your reorder has been successfully placed and confirmed. We're excited to process your order again!
        </p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #333; margin: 0 0 10px 0;">Reorder Details:</h3>
          <p style="margin: 5px 0; color: #666;">
            <strong>Order ID:</strong> ${orderId}
          </p>
          <p style="margin: 5px 0; color: #666;">
            <strong>Order Date:</strong> ${new Date().toLocaleDateString()}
          </p>
        </div>
        
        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <h4 style="color: #2e7d32; margin: 0 0 10px 0;">What's Next?</h4>
          <ul style="color: #333; margin: 0; padding-left: 20px;">
            <li>We'll process your reorder and prepare it for shipping</li>
            <li>You'll receive a shipping confirmation email with tracking details</li>
            <li>Your order will be delivered to your specified address</li>
            <li>You'll also receive a detailed invoice email with PDF attachment</li>
          </ul>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Thank you for choosing to shop with us again! We appreciate your continued trust in our products and service.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">
            Thank you for your continued trust!
          </p>
          <p style="color: #999; font-size: 12px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    </div>
  `;

  const textContent = `
Reorder Confirmed!

Dear Customer,

Great news! Your reorder has been successfully placed and confirmed. We're excited to process your order again!

Reorder Details:
- Order ID: ${orderId}
- Order Date: ${new Date().toLocaleDateString()}

What's Next?
- We'll process your reorder and prepare it for shipping
- You'll receive a shipping confirmation email with tracking details
- Your order will be delivered to your specified address
- You'll also receive a detailed invoice email with PDF attachment

Thank you for choosing to shop with us again! We appreciate your continued trust in our products and service.

Thank you for your continued trust!

This is an automated email. Please do not reply to this message.
  `;

  await sendEmail(to, `Reorder Confirmation #${orderId}`, textContent, htmlContent);
};

module.exports = { sendEmail, sendInvoiceEmail, sendWelcomeEmail, sendReorderEmail, sendOrderCancellationEmail, sendReorderConfirmationEmail }; 