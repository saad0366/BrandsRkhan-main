import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { LocalOffer, Schedule } from '@mui/icons-material';

const OfferCard = ({ offer }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
        color: 'white',
        mb: 2,
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocalOffer sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {offer.name}
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
          {offer.description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            label={`${offer.discountPercentage}% OFF`}
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 700,
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="caption">
              Until {formatDate(offer.endDate)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OfferCard;