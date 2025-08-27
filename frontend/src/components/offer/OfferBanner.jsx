import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
} from '@mui/material';
import {
  LocalOffer,
  Schedule,
  Discount,
} from '@mui/icons-material';

const OfferBanner = ({ offers }) => {
  if (!offers || offers.length === 0) return null;

  const bestOffer = offers.slice().sort((a, b) => b.discountPercentage - a.discountPercentage)[0];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%)',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.1)',
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Main Offer */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalOffer sx={{ fontSize: 40, color: '#fff', mr: 2 }} />
              <Typography
                variant="h3"
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                }}
              >
                {bestOffer.name}
              </Typography>
            </Box>
            
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 2,
                maxWidth: '600px',
              }}
            >
              {bestOffer.description}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Chip
                icon={<Discount />}
                label={`${bestOffer.discountPercentage}% OFF`}
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  px: 2,
                  py: 1,
                  backdropFilter: 'blur(10px)',
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Valid until {formatDate(bestOffer.endDate)}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/products"
              sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#333',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: '50px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  background: '#fff',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                },
              }}
            >
              Shop Now & Save
            </Button>
          </Grid>

          {/* Additional Offers */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {offers.slice(1, 3).map((offer) => (
                <Card
                  key={offer._id}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: '#fff', fontWeight: 600, mb: 1 }}
                    >
                      {offer.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={`${offer.discountPercentage}% OFF`}
                        size="small"
                        sx={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Until {formatDate(offer.endDate)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default OfferBanner;