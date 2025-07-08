module.exports = {
  // Company information
  company: {
    name: 'Brands R Khan',
    address: '123 Business Street',
    city: 'Lahore, Pakistan',
    phone: '(555) 123-4567',
    email: 'info@brandsrkhan.com',
    website: 'https://brandsrkhan.com'
  },
  
  // Invoice settings
  invoice: {
    prefix: 'INV',
    numberLength: 8, // Length of order ID to use in invoice number
    currency: 'USD',
    currencySymbol: '$',
    taxRate: 0, // Set to 0 for no tax, or percentage like 0.08 for 8%
    retentionDays: 30 // How long to keep invoice files
  },
  
  // Email settings
  email: {
    subject: 'Your Invoice for Order #{orderId}',
    fromName: 'Your Store Name',
    replyTo: 'support@yourstore.com'
  },
  
  // PDF settings
  pdf: {
    pageSize: 'A4',
    margin: 50,
    fontFamily: 'Helvetica',
    fontSize: {
      title: 24,
      subtitle: 20,
      header: 12,
      body: 10,
      footer: 8
    }
  }
}; 