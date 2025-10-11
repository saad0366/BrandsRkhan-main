module.exports = {
  // Company information
  company: {
    name: 'BrandsRkhan',
    tagline: 'Premium Quality Products',
    address: 'Main Boulevard, Gulberg III',
    city: 'Lahore, Punjab 54000, Pakistan',
    phone: '+92-42-123-4567',
    email: 'brandrkhanofficial@gmail.com',
    website: 'https://brands-r-khan.com',
    colors: {
      primary: '#1976d2',
      secondary: '#dc004e',
      success: '#388e3c',
      text: '#333333'
    }
  },
  
  // Invoice settings
  invoice: {
    prefix: 'BRK',
    numberLength: 8,
    currency: 'PKR',
    currencySymbol: 'PKR ',
    taxRate: 0,
    retentionDays: 30
  },
  
  // Email settings
  email: {
    subject: 'Invoice from BrandsRkhan - Order #{orderId}',
    fromName: 'BrandsRkhan',
    replyTo: 'brandrkhanofficial@gmail.com'
  },
  
  // PDF settings
  pdf: {
    pageSize: 'A4',
    margin: 40,
    fontFamily: 'Helvetica',
    fontSize: {
      title: 28,
      subtitle: 18,
      header: 14,
      body: 11,
      footer: 9
    }
  }
}; 