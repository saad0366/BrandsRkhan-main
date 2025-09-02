const config = require('../config/invoiceConfig');

const getEmailTemplate = (type, data) => {
  const baseStyle = `
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background-color: white; }
      .header { background: linear-gradient(135deg, ${config.company.colors.primary} 0%, ${config.company.colors.secondary} 100%); color: white; padding: 30px; text-align: center; }
      .logo { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
      .tagline { font-size: 14px; opacity: 0.9; }
      .content { padding: 30px; }
      .order-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
      .total-row { display: flex; justify-content: space-between; padding: 15px 0; font-weight: bold; font-size: 18px; color: ${config.company.colors.primary}; }
      .footer { background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
      .btn { display: inline-block; padding: 12px 24px; background-color: ${config.company.colors.primary}; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      .success { color: ${config.company.colors.success}; font-weight: bold; }
    </style>
  `;

  switch (type) {
    case 'orderConfirmation':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation - BrandsRkhan</title>
          ${baseStyle}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">BrandsRkhan</div>
              <div class="tagline">${config.company.tagline}</div>
            </div>
            
            <div class="content">
              <h2>Thank you for your order!</h2>
              <p>Dear ${data.customerName},</p>
              <p>We're excited to confirm that we've received your order. Here are the details:</p>
              
              <div class="order-details">
                <h3>Order #${data.orderId}</h3>
                <p><strong>Order Date:</strong> ${new Date(data.orderDate).toLocaleDateString()}</p>
                <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
                <p><strong>Status:</strong> <span class="success">Confirmed</span></p>
              </div>

              <h3>Items Ordered:</h3>
              ${data.items.map(item => `
                <div class="item-row">
                  <span>${item.name} (x${item.quantity})</span>
                  <span>PKR ${item.total}</span>
                </div>
              `).join('')}
              
              <div class="total-row">
                <span>Total Amount:</span>
                <span>PKR ${data.totalAmount}</span>
              </div>

              <p>We'll send you another email when your order ships. If you have any questions, feel free to contact us.</p>
              
              <a href="${config.company.website}" class="btn">Track Your Order</a>
            </div>
            
            <div class="footer">
              <p><strong>BrandsRkhan</strong></p>
              <p>${config.company.address}<br>${config.company.city}</p>
              <p>Phone: ${config.company.phone} | Email: ${config.company.email}</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'invoiceEmail':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice - BrandsRkhan</title>
          ${baseStyle}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">BrandsRkhan</div>
              <div class="tagline">${config.company.tagline}</div>
            </div>
            
            <div class="content">
              <h2>Your Invoice is Ready</h2>
              <p>Dear ${data.customerName},</p>
              <p>Please find attached your invoice for order #${data.orderId}.</p>
              
              <div class="order-details">
                <h3>Invoice Details</h3>
                <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
                <p><strong>Order Date:</strong> ${new Date(data.orderDate).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> PKR ${data.totalAmount}</p>
                <p><strong>Payment Status:</strong> <span class="success">${data.paymentStatus}</span></p>
              </div>

              <p>Thank you for choosing BrandsRkhan. We appreciate your business!</p>
              
              <a href="${config.company.website}" class="btn">Visit Our Store</a>
            </div>
            
            <div class="footer">
              <p><strong>BrandsRkhan</strong></p>
              <p>${config.company.address}<br>${config.company.city}</p>
              <p>Phone: ${config.company.phone} | Email: ${config.company.email}</p>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      return '';
  }
};

module.exports = { getEmailTemplate };