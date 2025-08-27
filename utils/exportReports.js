const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const csv = require('csv-writer').createObjectCsvWriter;

/**
 * Export offer analytics data to various formats (PDF, Excel, CSV)
 * @param {Object} data - The analytics data to export
 * @param {String} format - The export format (pdf, excel, csv)
 * @param {String} fileName - The name of the file to create (without extension)
 * @returns {Object} - Object containing the file path and success status
 */
exports.exportOfferAnalytics = async (data, format, fileName) => {
  try {
    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Generate timestamp for unique filenames
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileNameWithTimestamp = `${fileName}-${timestamp}`;
    
    let filePath;
    
    switch (format.toLowerCase()) {
      case 'pdf':
        filePath = await exportToPDF(data, fileNameWithTimestamp, reportsDir);
        break;
      case 'excel':
        filePath = await exportToExcel(data, fileNameWithTimestamp, reportsDir);
        break;
      case 'csv':
        filePath = await exportToCSV(data, fileNameWithTimestamp, reportsDir);
        break;
      default:
        throw new Error('Unsupported export format');
    }
    
    return {
      success: true,
      filePath: filePath.replace(/\\/g, '/') // Normalize path for frontend
    };
  } catch (error) {
    console.error('Error exporting report:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Export data to PDF format
 * @param {Object} data - The analytics data
 * @param {String} fileName - The file name
 * @param {String} reportsDir - The reports directory
 * @returns {String} - The file path
 */
const exportToPDF = async (data, fileName, reportsDir) => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = path.join(reportsDir, `${fileName}.pdf`);
      const doc = new PDFDocument({ margin: 50 });
      
      // Pipe the PDF to a file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Add title
      doc.fontSize(20).text('Offer Analytics Report', { align: 'center' });
      doc.moveDown();
      
      // Add date range
      if (data.dateRange) {
        doc.fontSize(12).text(`Report Period: ${new Date(data.dateRange.start).toLocaleDateString()} to ${new Date(data.dateRange.end).toLocaleDateString()}`, { align: 'center' });
        doc.moveDown();
      }
      
      // Add summary section
      doc.fontSize(16).text('Summary', { underline: true });
      doc.moveDown(0.5);
      
      const summary = data.summary;
      Object.entries(summary).forEach(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        doc.fontSize(12).text(`${formattedKey}: ${value}`);
      });
      
      doc.moveDown();
      
      // Add top offers section
      doc.fontSize(16).text('Top Performing Offers', { underline: true });
      doc.moveDown(0.5);
      
      // By redemptions
      doc.fontSize(14).text('By Redemptions:');
      doc.moveDown(0.5);
      
      data.topOffers.byRedemptions.forEach((offer, index) => {
        doc.fontSize(12).text(`${index + 1}. ${offer.name} - ${offer.redemptions} redemptions (${offer.discountPercentage}% discount)`);
      });
      
      doc.moveDown();
      
      // By revenue
      doc.fontSize(14).text('By Revenue:');
      doc.moveDown(0.5);
      
      data.topOffers.byRevenue.forEach((offer, index) => {
        doc.fontSize(12).text(`${index + 1}. ${offer.name} - $${offer.revenue} revenue`);
      });
      
      doc.moveDown();
      
      // Add category analytics
      if (data.categoryAnalytics && data.categoryAnalytics.length > 0) {
        doc.fontSize(16).text('Category Performance', { underline: true });
        doc.moveDown(0.5);
        
        data.categoryAnalytics.forEach((category) => {
          doc.fontSize(12).text(`${category.category}: $${category.revenue} (${category.percentageOfTotal}% of total)`);
        });
      }
      
      // Finalize the PDF and end the stream
      doc.end();
      
      stream.on('finish', () => {
        resolve(filePath);
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export data to Excel format
 * @param {Object} data - The analytics data
 * @param {String} fileName - The file name
 * @param {String} reportsDir - The reports directory
 * @returns {String} - The file path
 */
const exportToExcel = async (data, fileName, reportsDir) => {
  const filePath = path.join(reportsDir, `${fileName}.xlsx`);
  const workbook = new ExcelJS.Workbook();
  
  // Add summary worksheet
  const summarySheet = workbook.addWorksheet('Summary');
  
  // Add title
  summarySheet.mergeCells('A1:D1');
  summarySheet.getCell('A1').value = 'Offer Analytics Report';
  summarySheet.getCell('A1').font = { size: 16, bold: true };
  summarySheet.getCell('A1').alignment = { horizontal: 'center' };
  
  // Add date range
  if (data.dateRange) {
    summarySheet.mergeCells('A2:D2');
    summarySheet.getCell('A2').value = `Report Period: ${new Date(data.dateRange.start).toLocaleDateString()} to ${new Date(data.dateRange.end).toLocaleDateString()}`;
    summarySheet.getCell('A2').alignment = { horizontal: 'center' };
  }
  
  // Add summary data
  summarySheet.addRow([]);
  summarySheet.addRow(['Summary Metrics']);
  summarySheet.addRow(['Metric', 'Value']);
  
  Object.entries(data.summary).forEach(([key, value]) => {
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    summarySheet.addRow([formattedKey, value]);
  });
  
  // Add offers worksheet
  const offersSheet = workbook.addWorksheet('Offers');
  
  // Add headers
  offersSheet.addRow([
    'Offer Name', 
    'Redemptions', 
    'Revenue', 
    'Discount Given', 
    'ROI', 
    'Conversion Rate', 
    'Avg Order Value',
    'Discount %',
    'Start Date',
    'End Date',
    'Status'
  ]);
  
  // Add data
  data.analytics.forEach(offer => {
    offersSheet.addRow([
      offer.name,
      offer.redemptions,
      offer.revenue,
      offer.discountGiven,
      `${offer.roi}%`,
      `${offer.conversionRate}%`,
      offer.avgOrderValue,
      `${offer.discountPercentage}%`,
      new Date(offer.startDate).toLocaleDateString(),
      new Date(offer.endDate).toLocaleDateString(),
      offer.active ? 'Active' : 'Inactive'
    ]);
  });
  
  // Add category worksheet
  if (data.categoryAnalytics && data.categoryAnalytics.length > 0) {
    const categorySheet = workbook.addWorksheet('Categories');
    
    // Add headers
    categorySheet.addRow([
      'Category',
      'Order Count',
      'Revenue',
      'Item Count',
      'Percentage of Total'
    ]);
    
    // Add data
    data.categoryAnalytics.forEach(category => {
      categorySheet.addRow([
        category.category,
        category.orderCount,
        category.revenue,
        category.itemCount,
        `${category.percentageOfTotal}%`
      ]);
    });
  }
  
  // Save the workbook
  await workbook.xlsx.writeFile(filePath);
  
  return filePath;
};

/**
 * Export data to CSV format
 * @param {Object} data - The analytics data
 * @param {String} fileName - The file name
 * @param {String} reportsDir - The reports directory
 * @returns {String} - The file path
 */
const exportToCSV = async (data, fileName, reportsDir) => {
  const filePath = path.join(reportsDir, `${fileName}.csv`);
  
  // Create CSV writer
  const csvWriter = csv({
    path: filePath,
    header: [
      { id: 'name', title: 'Offer Name' },
      { id: 'redemptions', title: 'Redemptions' },
      { id: 'revenue', title: 'Revenue' },
      { id: 'discountGiven', title: 'Discount Given' },
      { id: 'roi', title: 'ROI (%)' },
      { id: 'conversionRate', title: 'Conversion Rate (%)' },
      { id: 'avgOrderValue', title: 'Avg Order Value' },
      { id: 'discountPercentage', title: 'Discount (%)' },
      { id: 'startDate', title: 'Start Date' },
      { id: 'endDate', title: 'End Date' },
      { id: 'status', title: 'Status' }
    ]
  });
  
  // Format data for CSV
  const records = data.analytics.map(offer => ({
    name: offer.name,
    redemptions: offer.redemptions,
    revenue: offer.revenue,
    discountGiven: offer.discountGiven,
    roi: offer.roi,
    conversionRate: offer.conversionRate,
    avgOrderValue: offer.avgOrderValue,
    discountPercentage: offer.discountPercentage,
    startDate: new Date(offer.startDate).toLocaleDateString(),
    endDate: new Date(offer.endDate).toLocaleDateString(),
    status: offer.active ? 'Active' : 'Inactive'
  }));
  
  // Write to CSV file
  await csvWriter.writeRecords(records);
  
  return filePath;
};