# Invoice System Documentation

## Overview
This e-commerce application includes an automated invoice generation and email system that creates professional PDF invoices for every order placed by users.

## Features

### 🎯 Core Functionality
- **Automatic PDF Generation**: Creates professional invoices using PDFKit
- **Email Delivery**: Sends invoices via email with HTML formatting
- **File Management**: Stores invoices locally with automatic cleanup
- **Download Access**: Users can download their invoices via API

### 📋 Invoice Contents
- Company header with branding
- Invoice number and order details
- Customer information
- Itemized product list with quantities and prices
- Subtotal, tax, and total calculations
- Payment status
- Professional footer

### 🔧 Configuration
All invoice settings are configurable via `config/invoiceConfig.js`:
- Company information
- Currency and tax settings
- Email templates
- PDF formatting options

## File Structure

```
├── utils/
│   ├── generateInvoice.js      # PDF generation logic
│   ├── sendEmail.js           # Enhanced email utility
│   └── cleanupInvoices.js     # File cleanup utilities
├── config/
│   └── invoiceConfig.js       # Invoice configuration
├── controllers/
│   └── orderController.js     # Updated with invoice generation
├── routes/
│   └── orderRoutes.js         # Added invoice download route
├── invoices/                  # Generated PDF storage
└── server.js                  # Added cleanup scheduling
```

## API Endpoints

### Generate Invoice (Automatic)
- **Trigger**: When order is placed (`POST /api/v1/orders`)
- **Action**: Automatically generates PDF and sends email

### Download Invoice
- **Endpoint**: `GET /api/v1/orders/:id/invoice`
- **Access**: Order owner or admin
- **Response**: PDF file download

## Configuration

### Company Information
```javascript
company: {
  name: 'Your Store Name',
  address: '123 Business Street',
  city: 'City, State 12345',
  phone: '(555) 123-4567',
  email: 'info@yourstore.com',
  website: 'https://yourstore.com'
}
```

### Invoice Settings
```javascript
invoice: {
  prefix: 'INV',
  numberLength: 8,
  currency: 'USD',
  currencySymbol: '$',
  taxRate: 0, // 0.08 for 8% tax
  retentionDays: 30
}
```

## Email Template

The system sends professional HTML emails with:
- Order confirmation message
- Order details (ID, invoice number, date)
- Next steps information
- PDF invoice attachment

## File Management

### Storage
- Invoices stored in `/invoices/` directory
- Filename format: `invoice-{orderId}.pdf`
- Automatic directory creation

### Cleanup
- Scheduled daily cleanup at 2 AM
- Removes invoices older than 30 days (configurable)
- Prevents disk space issues

## Error Handling

### Graceful Degradation
- Invoice generation failures don't prevent order placement
- Errors logged to console for debugging
- Email failures handled separately from order processing

### Common Issues
1. **Email Configuration**: Ensure `EMAIL_USER` and `EMAIL_PASS` in `.env`
2. **File Permissions**: Ensure write access to `/invoices/` directory
3. **PDF Generation**: Check for sufficient memory and disk space

## Best Practices

### Security
- Invoice access restricted to order owner and admins
- File paths validated to prevent directory traversal
- Sensitive data not logged

### Performance
- PDF generation is asynchronous
- File cleanup runs during low-traffic hours
- Invoice files compressed and optimized

### Maintenance
- Monitor disk space usage
- Review and update company information regularly
- Test email delivery periodically

## Customization

### Styling
- Modify `config/invoiceConfig.js` for branding
- Update email templates in `utils/sendEmail.js`
- Customize PDF layout in `utils/generateInvoice.js`

### Tax Calculation
- Set `taxRate` in config for automatic tax calculation
- Support for different tax rates per region
- Tax display in invoice totals

### Email Templates
- HTML and text versions available
- Customizable branding and messaging
- Support for multiple languages

## Testing

### Manual Testing
1. Place a new order
2. Check email delivery
3. Verify PDF generation
4. Test download functionality

### Automated Testing
- Unit tests for PDF generation
- Email delivery verification
- File cleanup validation

## Troubleshooting

### Invoice Not Generated
- Check console logs for errors
- Verify email configuration
- Ensure file permissions

### Email Not Sent
- Verify SMTP settings
- Check email credentials
- Review email service limits

### PDF Download Issues
- Verify file exists in `/invoices/`
- Check user permissions
- Validate order ownership

## Future Enhancements

### Planned Features
- Invoice templates selection
- Multi-language support
- Digital signatures
- Cloud storage integration
- Invoice analytics

### Integration Opportunities
- Accounting software integration
- Payment gateway integration
- Customer portal enhancement
- Admin dashboard improvements 