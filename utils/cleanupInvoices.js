const fs = require('fs');
const path = require('path');
const config = require('../config/invoiceConfig');

// Clean up invoice files older than specified days
const cleanupOldInvoices = (daysToKeep = config.invoice.retentionDays) => {
  const invoicesDir = path.join(__dirname, '..', 'invoices');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  try {
    if (!fs.existsSync(invoicesDir)) {
      console.log('Invoices directory does not exist');
      return;
    }

    const files = fs.readdirSync(invoicesDir);
    let deletedCount = 0;

    files.forEach(file => {
      if (file.endsWith('.pdf')) {
        const filePath = path.join(invoicesDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`Deleted old invoice: ${file}`);
        }
      }
    });

    console.log(`Cleanup completed: ${deletedCount} old invoice files deleted`);
  } catch (error) {
    console.error('Error during invoice cleanup:', error);
  }
};

// Get invoice file info
const getInvoiceInfo = (orderId) => {
  const filename = `invoice-${orderId}.pdf`;
  const filepath = path.join(__dirname, '..', 'invoices', filename);
  
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    return {
      exists: true,
      filename,
      filepath,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    };
  }
  
  return { exists: false };
};

module.exports = { cleanupOldInvoices, getInvoiceInfo }; 