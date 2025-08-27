import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  LocalOffer,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { getActiveOffers } from '../../redux/slices/offerSlice';
import { applyOfferToCart, validateOffer } from '../../api/offerAPI';
import { formatCurrency } from '../../utils/formatters';

const OfferApplicator = ({ cartItems, cartTotal, onOfferApplied }) => {
  const dispatch = useDispatch();
  const { available: offers, loading } = useSelector(state => state.offers);
  const [selectedOffer, setSelectedOffer] = useState('');
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    dispatch(getActiveOffers());
  }, [dispatch]);

  const handleApplyOffer = async () => {
    if (!selectedOffer) return;

    setApplying(true);
    setError('');

    try {
      const offerData = {
        offerId: selectedOffer,
        cartTotal,
        products: cartItems.map(item => item.product),
      };

      const response = await validateOffer(offerData);
      
      if (response.data.success) {
        const { discountAmount, finalTotal } = response.data.data;
        const offer = offers.find(o => o._id === selectedOffer);
        
        setAppliedOffer(offer);
        setDiscount(discountAmount);
        
        if (onOfferApplied) {
          onOfferApplied({
            offer,
            discount: discountAmount,
            finalTotal,
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply offer');
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveOffer = () => {
    setAppliedOffer(null);
    setDiscount(0);
    setSelectedOffer('');
    if (onOfferApplied) {
      onOfferApplied(null);
    }
  };

  const getEligibleOffers = () => {
    return offers.filter(offer => {
      // Check minimum purchase amount
      if (offer.minimumPurchaseAmount && cartTotal < offer.minimumPurchaseAmount) {
        return false;
      }
      
      // Check if products are eligible
      if (offer.applicableProducts && offer.applicableProducts.length > 0) {
        const cartProductIds = cartItems.map(item => item.product);
        const hasEligibleProduct = cartProductIds.some(id => 
          offer.applicableProducts.includes(id)
        );
        if (!hasEligibleProduct) return false;
      }
      
      return true;
    });
  };

  const eligibleOffers = getEligibleOffers();

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Loading offers...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalOffer color="primary" />
        Apply Offer
      </Typography>

      {appliedOffer ? (
        <Box>
          <Alert
            severity="success"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleRemoveOffer}
                startIcon={<Cancel />}
              >
                Remove
              </Button>
            }
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {appliedOffer.name} Applied!
              </Typography>
              <Typography variant="body2">
                You saved {formatCurrency(discount)} ({appliedOffer.discountPercentage}% off)
              </Typography>
            </Box>
          </Alert>
        </Box>
      ) : (
        <Box>
          {eligibleOffers.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No offers available for your current cart. Add more items or increase your cart value to unlock offers!
            </Alert>
          ) : (
            <Box>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select an offer</InputLabel>
                <Select
                  value={selectedOffer}
                  label="Select an offer"
                  onChange={(e) => setSelectedOffer(e.target.value)}
                >
                  {eligibleOffers.map((offer) => (
                    <MenuItem key={offer._id} value={offer._id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography>{offer.name}</Typography>
                        <Chip
                          label={`${offer.discountPercentage}% OFF`}
                          size="small"
                          color="success"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedOffer && (
                <Box sx={{ mb: 2 }}>
                  {(() => {
                    const offer = offers.find(o => o._id === selectedOffer);
                    return (
                      <Alert severity="info">
                        <Typography variant="body2">
                          <strong>{offer.name}:</strong> {offer.description}
                        </Typography>
                        {offer.minimumPurchaseAmount > 0 && (
                          <Typography variant="caption" display="block">
                            Minimum purchase: {formatCurrency(offer.minimumPurchaseAmount)}
                          </Typography>
                        )}
                        {offer.maximumDiscountAmount && (
                          <Typography variant="caption" display="block">
                            Maximum discount: {formatCurrency(offer.maximumDiscountAmount)}
                          </Typography>
                        )}
                      </Alert>
                    );
                  })()}
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={handleApplyOffer}
                disabled={!selectedOffer || applying}
                startIcon={applying ? <CircularProgress size={20} /> : <CheckCircle />}
              >
                {applying ? 'Applying...' : 'Apply Offer'}
              </Button>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      )}

      {offers.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Available Offers:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {offers.slice(0, 3).map((offer) => (
              <Chip
                key={offer._id}
                label={`${offer.name} - ${offer.discountPercentage}% OFF`}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default OfferApplicator;