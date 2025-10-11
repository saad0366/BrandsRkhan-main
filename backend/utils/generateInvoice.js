const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const config = require('../config/invoiceConfig');

const generateInvoice = async (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      // Create invoice filename
      const invoiceNumber = `${config.invoice.prefix}-${order._id.toString().slice(-config.invoice.numberLength).toUpperCase()}`;
      const filename = `invoice-${order._id}.pdf`;
      const filepath = path.join(__dirname, '..', 'invoices', filename);

      // Create PDF document
      const doc = new PDFDocument({
        size: config.pdf.pageSize,
        margin: config.pdf.margin
      });

      // Create write stream
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Add professional header with branding
      doc.rect(0, 0, doc.page.width, 120).fill('#1976d2');
      
      doc.fontSize(config.pdf.fontSize.title)
         .font('Helvetica-Bold')
         .fillColor('white')
         .text(config.company.name, 50, 30, { align: 'left' })
         .fontSize(12)
         .font('Helvetica')
         .text(config.company.tagline, 50, 65, { align: 'left' })
         .fontSize(10)
         .text(`${config.company.address}`, 400, 30, { align: 'right', width: 150 })
         .text(`${config.company.city}`, 400, 45, { align: 'right', width: 150 })
         .text(`Phone: ${config.company.phone}`, 400, 60, { align: 'right', width: 150 })
         .text(`Email: ${config.company.email}`, 400, 75, { align: 'right', width: 150 })
         .fillColor('black')
         .moveDown(3);

      // Add invoice title with styling
      doc.rect(50, 140, 500, 40).fill('#f8f9fa').stroke('#ddd');
      doc.fontSize(config.pdf.fontSize.subtitle)
         .font('Helvetica-Bold')
         .fillColor('#1976d2')
         .text('INVOICE', 50, 155, { align: 'center', width: 500 })
         .fillColor('black')
         .moveDown(2);

      // Invoice details section
      const invoiceDetails = {
        'Invoice Number:': invoiceNumber,
        'Order ID:': order._id.toString(),
        'Date:': new Date(order.createdAt).toLocaleDateString(),
        'Due Date:': new Date(order.createdAt).toLocaleDateString()
      };

      // Customer details section
      const customerDetails = {
        'Bill To:': user.name,
        'Email:': user.email,
        'Address:': `${order.shippingAddress.address}`,
        'City:': `${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`,
        'Country:': order.shippingAddress.country
      };

      // Create two columns for invoice and customer details
      doc.fontSize(config.pdf.fontSize.body);
      
      // Left column - Invoice details
      doc.font('Helvetica-Bold').text('Invoice Details', 50, 200);
      doc.font('Helvetica');
      let yPosition = 220;
      Object.entries(invoiceDetails).forEach(([key, value]) => {
        doc.text(key, 50, yPosition);
        doc.text(value, 150, yPosition);
        yPosition += 20;
      });

      // Right column - Customer details
      doc.font('Helvetica-Bold').text('Customer Details', 300, 200);
      doc.font('Helvetica');
      yPosition = 220;
      Object.entries(customerDetails).forEach(([key, value]) => {
        doc.text(key, 300, yPosition);
        doc.text(value, 400, yPosition);
        yPosition += 20;
      });

      // Add items table
      doc.moveDown(3);
      const tableTop = yPosition + 40;
      
      // Table headers with background
      doc.rect(50, tableTop - 5, 500, 25).fill('#1976d2');
      doc.font('Helvetica-Bold')
         .fontSize(config.pdf.fontSize.body)
         .fillColor('white')
         .text('Item', 60, tableTop + 5)
         .text('Qty', 250, tableTop + 5)
         .text('Price', 350, tableTop + 5)
         .text('Total', 450, tableTop + 5)
         .fillColor('black');

      // No separator line needed with background

      // Table rows with alternating colors
      let currentY = tableTop + 25;
      order.orderItems.forEach((item, index) => {
        const effectivePrice = item.discountedPrice || item.price;
        const itemTotal = effectivePrice * item.quantity;
        const rowHeight = item.discountedPrice && item.discountedPrice < item.price ? 35 : 25;
        
        // Alternating row background
        if (index % 2 === 0) {
          doc.rect(50, currentY - 2, 500, rowHeight).fill('#f8f9fa');
        }
        
        doc.font('Helvetica')
           .fontSize(config.pdf.fontSize.body)
           .fillColor('black')
           .text(item.name, 60, currentY, { width: 180 })
           .text(item.quantity.toString(), 250, currentY);
        
        // Show discounted price with original price
        if (item.discountedPrice && item.discountedPrice < item.price) {
          doc.fillColor('#388e3c')
             .text(`${config.invoice.currencySymbol}${item.discountedPrice.toFixed(0)}`, 350, currentY)
             .fontSize(8)
             .fillColor('#666')
             .text(`(was ${config.invoice.currencySymbol}${item.price.toFixed(0)})`, 350, currentY + 12)
             .fontSize(config.pdf.fontSize.body)
             .fillColor('black');
        } else {
          doc.text(`${config.invoice.currencySymbol}${item.price.toFixed(0)}`, 350, currentY);
        }
        
        doc.font('Helvetica-Bold')
           .text(`${config.invoice.currencySymbol}${itemTotal.toFixed(0)}`, 450, currentY)
           .font('Helvetica');
        
        currentY += rowHeight;
      });

      // Table bottom border
      doc.rect(50, currentY + 5, 500, 2).fill('#1976d2');

      // Calculate totals
      const subtotal = order.itemsPrice || order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const discount = order.discount || 0;
      const shippingCharges = order.shippingPrice || 100;
      const total = order.totalPrice;

      // Totals section with styling
      currentY += 30;
      doc.rect(350, currentY - 10, 200, 120).fill('#f8f9fa').stroke('#ddd');
      
      currentY += 10;
      doc.font('Helvetica')
         .fontSize(config.pdf.fontSize.body)
         .text('Subtotal:', 360, currentY)
         .text(`${config.invoice.currencySymbol}${subtotal.toFixed(0)}`, 480, currentY);
      
      // Show discount if applicable
      if (discount > 0) {
        currentY += 20;
        doc.fillColor('#388e3c')
           .text('Discount:', 360, currentY)
           .text(`-${config.invoice.currencySymbol}${discount.toFixed(0)}`, 480, currentY)
           .fillColor('black');
      }
      
      currentY += 20;
      doc.fillColor('black')
         .text('Shipping:', 360, currentY)
         .text(`${config.invoice.currencySymbol}${shippingCharges.toFixed(0)}`, 480, currentY);
      
      currentY += 25;
      doc.rect(360, currentY - 5, 180, 25).fill('#1976d2');
      doc.fontSize(config.pdf.fontSize.header)
         .font('Helvetica-Bold')
         .fillColor('white')
         .text('Total:', 370, currentY + 5)
         .fillColor('white')
         .text(`${config.invoice.currencySymbol}${total.toFixed(0)}`, 480, currentY + 5)
         .fillColor('black');

      // Payment status
      currentY += 30;
      doc.fontSize(config.pdf.fontSize.body)
         .font('Helvetica')
         .text(`Payment Status: ${order.isPaid ? 'Paid' : 'Pending'}`, 50, currentY);
      
      if (order.isPaid && order.paidAt) {
        currentY += 20;
        doc.text(`Paid on: ${new Date(order.paidAt).toLocaleDateString()}`, 50, currentY);
      }

      // Professional footer
      const footerY = doc.page.height - 100;
      doc.rect(0, footerY - 20, doc.page.width, 100).fill('#333');
      
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('white')
         .text('Thank you for choosing BrandsRkhan!', 50, footerY, { align: 'center', width: 500 })
         .fontSize(config.pdf.fontSize.footer)
         .font('Helvetica')
         .text('This is a computer-generated invoice. No signature required.', 50, footerY + 20, { align: 'center', width: 500 })
         .text(`Visit us: ${config.company.website}`, 50, footerY + 35, { align: 'center', width: 500 });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve({ filepath, filename, invoiceNumber });
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateInvoice; 