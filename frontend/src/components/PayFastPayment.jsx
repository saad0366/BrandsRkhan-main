import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CreditCard, Security } from '@mui/icons-material';

const PayFastPayment = ({ orderTotal, originalTotal, discount, onPaymentSubmit, loading }) => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const handleInputChange = (field) => (event) => {
    let value = event.target.value;
    
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (value.length > 19) return;
    }
    
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (value.length > 5) return;
    }
    
    if (field === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 4) return;
    }

    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPaymentSubmit(cardDetails);
  };

  const isFormValid = () => {
    return (
      cardDetails.cardNumber.replace(/\s/g, '').length >= 13 &&
      cardDetails.expiryDate.length === 5 &&
      cardDetails.cvv.length >= 3 &&
      cardDetails.cardholderName.trim().length > 0
    );
  };

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', mt: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CreditCard sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">PayFast Secure Payment</Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Security sx={{ mr: 1 }} />
            Your payment is secured by PayFast SSL encryption
          </Box>
        </Alert>

        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
          Amount to Pay: PKR {orderTotal?.toFixed(0)}
        </Typography>
        {discount > 0 && (
          <Typography variant="body2" color="success.main" sx={{ textAlign: 'center', mb: 2 }}>
            🎉 You saved PKR {discount?.toFixed(0)} with offers!
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cardholder Name"
                value={cardDetails.cardholderName}
                onChange={handleInputChange('cardholderName')}
                required
                placeholder="John Doe"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                value={cardDetails.cardNumber}
                onChange={handleInputChange('cardNumber')}
                required
                placeholder="1234 5678 9012 3456"
                inputProps={{ maxLength: 19 }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                value={cardDetails.expiryDate}
                onChange={handleInputChange('expiryDate')}
                required
                placeholder="MM/YY"
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CVV"
                value={cardDetails.cvv}
                onChange={handleInputChange('cvv')}
                required
                placeholder="123"
                type="password"
                inputProps={{ maxLength: 4 }}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={!isFormValid() || loading}
            sx={{ mt: 3, py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              `Pay PKR ${orderTotal?.toFixed(0)} with PayFast`
            )}
          </Button>
        </form>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
          Powered by PayFast - South Africa's leading payment gateway
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PayFastPayment;