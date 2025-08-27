import React from 'react';
import { Box, Typography, Chip, Alert } from '@mui/material';
import { LocalOffer } from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters';

const OfferSelector = ({ offers, cartItems, onOfferApply }) => {
  if (!offers || offers.length === 0) return null;

  const getApplicableOffers = () => {
    return offers.filter(offer => {
      if (!offer.active) return false;
      const now = new Date();
      if (now < new Date(offer.startDate) || now > new Date(offer.endDate)) return false;
      
      // Check if any cart item is eligible
      return cartItems.some(item => {
        if (offer.applicableProducts && offer.applicableProducts.length > 0) {
          return offer.applicableProducts.includes(item.product);
        }
        if (offer.applicableCategories && offer.applicableCategories.length > 0) {
          return offer.applicableCategories.includes(item.category);
        }
        return true; // Global offer
      });
    });
  };

  const applicableOffers = getApplicableOffers();

  if (applicableOffers.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <LocalOffer sx={{ mr: 1 }} />
        Available Offers
      </Typography>
      {applicableOffers.map(offer => (
        <Alert 
          key={offer._id} 
          severity="success" 
          sx={{ mb: 1, cursor: 'pointer' }}
          onClick={() => onOfferApply && onOfferApply(offer)}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {offer.name}
              </Typography>
              <Typography variant="body2">
                {offer.description}
              </Typography>
            </Box>
            <Chip 
              label={`${offer.discountPercentage}% OFF`} 
              color="success" 
              size="small"
            />
          </Box>
        </Alert>
      ))}
    </Box>
  );
};

export default OfferSelector;