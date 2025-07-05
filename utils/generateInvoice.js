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

      // Add company header
      doc.fontSize(config.pdf.fontSize.title)
         .font('Helvetica-Bold')
         .text(config.company.name, { align: 'center' })
         .fontSize(config.pdf.fontSize.header)
         .font('Helvetica')
         .text(config.company.address, { align: 'center' })
         .text(config.company.city, { align: 'center' })
         .text(`Phone: ${config.company.phone} | Email: ${config.company.email}`, { align: 'center' })
         .moveDown(2);

      // Add invoice title and details
      doc.fontSize(config.pdf.fontSize.subtitle)
         .font('Helvetica-Bold')
         .text('INVOICE', { align: 'center' })
         .moveDown(1);

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
      
      // Table headers
      doc.font('Helvetica-Bold')
         .fontSize(config.pdf.fontSize.body)
         .text('Item', 50, tableTop)
         .text('Quantity', 250, tableTop)
         .text('Price', 350, tableTop)
         .text('Total', 450, tableTop);

      // Table separator line
      doc.moveTo(50, tableTop + 20)
         .lineTo(550, tableTop + 20)
         .stroke();

      // Table rows
      let currentY = tableTop + 30;
      order.orderItems.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        
        doc.font('Helvetica')
           .fontSize(config.pdf.fontSize.body)
           .text(item.name, 50, currentY)
           .text(item.quantity.toString(), 250, currentY)
           .text(`${config.invoice.currencySymbol}${item.price.toFixed(2)}`, 350, currentY)
           .text(`${config.invoice.currencySymbol}${itemTotal.toFixed(2)}`, 450, currentY);
        
        currentY += 25;
      });

      // Table bottom line
      doc.moveTo(50, currentY + 10)
         .lineTo(550, currentY + 10)
         .stroke();

      // Calculate tax
      const subtotal = order.totalPrice;
      const tax = subtotal * config.invoice.taxRate;
      const total = subtotal + tax;

      // Totals section
      currentY += 30;
      doc.font('Helvetica-Bold')
         .text('Subtotal:', 400, currentY)
         .text(`${config.invoice.currencySymbol}${subtotal.toFixed(2)}`, 500, currentY);
      
      currentY += 20;
      doc.text('Tax:', 400, currentY)
         .text(`${config.invoice.currencySymbol}${tax.toFixed(2)}`, 500, currentY);
      
      currentY += 20;
      doc.fontSize(config.pdf.fontSize.header)
         .text('Total:', 400, currentY)
         .text(`${config.invoice.currencySymbol}${total.toFixed(2)}`, 500, currentY);

      // Payment status
      currentY += 30;
      doc.fontSize(config.pdf.fontSize.body)
         .font('Helvetica')
         .text(`Payment Status: ${order.isPaid ? 'Paid' : 'Pending'}`, 50, currentY);
      
      if (order.isPaid && order.paidAt) {
        currentY += 20;
        doc.text(`Paid on: ${new Date(order.paidAt).toLocaleDateString()}`, 50, currentY);
      }

      // Footer
      doc.fontSize(config.pdf.fontSize.footer)
         .font('Helvetica')
         .text('Thank you for your business!', { align: 'center' })
         .text('This is a computer-generated invoice. No signature required.', { align: 'center' });

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