import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  LocalOffer,
  Schedule,
  CheckCircle,
} from '@mui/icons-material';
import { getActiveOffers } from '../../redux/slices/offerSlice';

const OfferList = () => {
  const dispatch = useDispatch();
  const { available: offers, loading, error } = useSelector(state => state.offers);

  useEffect(() => {
    dispatch(getActiveOffers());
  }, [dispatch]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Current Offers
        </Typography>
        <Alert severity="info">
          No active offers at the moment. Check back soon for great deals!
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Current Offers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Don't miss out on these amazing deals!
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {offers.map((offer) => (
          <Grid item xs={12} sm={6} md={4} key={offer._id}>
            <Card 
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocalOffer color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h3">
                    {offer.title}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {offer.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={`${offer.discountPercentage}% OFF`}
                    color="success"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <CheckCircle color="success" fontSize="small" />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Schedule fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Valid until {formatDate(offer.endDate)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default OfferList; 