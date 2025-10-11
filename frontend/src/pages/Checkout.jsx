import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Divider,
  Button,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { formatCurrency } from '../utils/formatters';
import { createOrder } from '../redux/slices/orderSlice';
import { clearUserCart } from '../redux/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import { getMyOrders } from '../redux/slices/orderSlice';
import { getActiveOffers } from '../redux/slices/offerSlice';
import CountdownTimer from '../components/common/CountdownTimer';
import PayFastPayment from '../components/PayFastPayment';

const Checkout = () => {
  const dispatch = useDispatch();
  const { items, totalPrice, discount, total } = useSelector(state => state.cart);
  const { available: offers } = useSelector(state => state.offers);
  const shipping = 100; // Flat shipping 100 PKR
  const navigate = useNavigate();
  const [showPayFast, setShowPayFast] = React.useState(false);
  const [paymentLoading, setPaymentLoading] = React.useState(false);

  useEffect(() => {
    dispatch(getActiveOffers());
  }, [dispatch]);



  // Helper: get best applicable offer for a product
  const getApplicableOffer = (item) => {
    if (!offers || !Array.isArray(offers) || offers.length === 0) return null;
    
    const validOffers = offers.filter(offer => {
      if (!offer || !offer.active) return false;
      
      const now = new Date();
      if (now < new Date(offer.startDate) || now > new Date(offer.endDate)) return false;
      
      // If no restrictions, apply to all products
      const hasProductRestrictions = offer.applicableProducts && offer.applicableProducts.length > 0;
      const hasCategoryRestrictions = offer.applicableCategories && offer.applicableCategories.length > 0;
      
      if (!hasProductRestrictions && !hasCategoryRestrictions) {
        return true; // Global offer
      }
      
      // Check product restrictions
      if (hasProductRestrictions && offer.applicableProducts.includes(item.product)) {
        return true;
      }
      
      // Check category restrictions
      if (hasCategoryRestrictions && item.category && offer.applicableCategories.includes(item.category)) {
        return true;
      }
      
      return false;
    });
    
    return validOffers.length > 0 ? validOffers.sort((a, b) => b.discountPercentage - a.discountPercentage)[0] : null;
  };

  // Helper: get discounted price for a cart item
  const getDiscountedPrice = (item) => {
    const offer = getApplicableOffer(item);
    if (!offer) return item.price;
    const discounted = item.price * (1 - offer.discountPercentage / 100);
    return Math.max(0, discounted);
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const totalDiscount = React.useMemo(() => {
    return items.reduce((sum, item) => {
      const offer = getApplicableOffer(item);
      if (!offer) return sum;
      const originalPrice = item.price;
      const discountedPrice = originalPrice * (1 - offer.discountPercentage / 100);
      const discount = (originalPrice - discountedPrice) * item.quantity;
      return sum + discount;
    }, 0);
  }, [items, offers]);
  
  const discountedTotal = subtotal - totalDiscount;
  const finalTotal = discountedTotal + shipping;

  const initialValues = {
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    paymentMethod: 'cash',
  };

  const validationSchema = Yup.object({
    fullName: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    postalCode: Yup.string().required('Postal code is required'),
    country: Yup.string().required('Country is required'),
    paymentMethod: Yup.string().required('Please select a payment method'),
  });

  const handlePlaceOrder = async (values) => {
    if (values.paymentMethod === 'payfast') {
      setShowPayFast(true);
      return;
    }
    
    try {
      const orderItems = items.map(item => {
        const offer = getApplicableOffer(item);
        const discountedPrice = getDiscountedPrice(item);
        return {
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          discountedPrice,
          offerId: offer ? offer._id : null,
        };
      });
      const orderData = {
        orderItems,
        shippingAddress: {
          address: values.address,
          city: values.city,
          postalCode: values.postalCode,
          country: values.country,
        },
        paymentMethod: values.paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shipping,
        discount: totalDiscount,
        totalPrice: finalTotal,
      };
      await dispatch(createOrder(orderData)).unwrap();
      await dispatch(clearUserCart());
      await dispatch(getMyOrders({ page: 1 })).unwrap();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error(error || 'Failed to place order');
    }
  };

  const handlePayFastPayment = async (cardDetails) => {
    setPaymentLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderItems = items.map(item => {
        const offer = getApplicableOffer(item);
        const discountedPrice = getDiscountedPrice(item);
        return {
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          discountedPrice,
          offerId: offer ? offer._id : null,
        };
      });
      
      const orderData = {
        orderItems,
        shippingAddress: {
          address: 'PayFast Address',
          city: 'PayFast City',
          postalCode: '12345',
          country: 'South Africa',
        },
        paymentMethod: 'payfast',
        itemsPrice: subtotal,
        shippingPrice: shipping,
        discount: totalDiscount,
        totalPrice: finalTotal,
        paymentDetails: cardDetails,
      };
      
      await dispatch(createOrder(orderData)).unwrap();
      await dispatch(clearUserCart());
      toast.success('Payment successful! Order placed.');
      navigate('/orders');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
      setShowPayFast(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handlePlaceOrder}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="fullName"
                    label="Full Name"
                    value={values.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.fullName && Boolean(errors.fullName)}
                    helperText={touched.fullName && errors.fullName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="address"
                    label="Address"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.address && Boolean(errors.address)}
                    helperText={touched.address && errors.address}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    name="city"
                    label="City"
                    value={values.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.city && Boolean(errors.city)}
                    helperText={touched.city && errors.city}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    name="postalCode"
                    label="Postal Code"
                    value={values.postalCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.postalCode && Boolean(errors.postalCode)}
                    helperText={touched.postalCode && errors.postalCode}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    name="country"
                    label="Country"
                    value={values.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.country && Boolean(errors.country)}
                    helperText={touched.country && errors.country}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              <FormLabel component="legend">Select a method</FormLabel>
              <RadioGroup
                name="paymentMethod"
                value={values.paymentMethod}
                onChange={handleChange}
              >
                <FormControlLabel value="cash" control={<Radio />} label="Cash on Delivery" />
                <FormControlLabel value="payfast" control={<Radio />} label="PayFast" />
              </RadioGroup>
              {touched.paymentMethod && errors.paymentMethod && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {errors.paymentMethod}
                </Typography>
              )}
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              {totalDiscount > 0 && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    🎉 You're saving {formatCurrency(totalDiscount)} with applied offers!
                  </Typography>
                </Alert>
              )}
              <Grid container spacing={2}>
                {items.map((item, idx) => {
                  const offer = getApplicableOffer(item);
                  const discountedPrice = getDiscountedPrice(item);
                  return (
                    <Grid item xs={12} key={item.product}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Qty: {item.quantity}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" fontWeight={600}>
                            {formatCurrency((offer ? discountedPrice : item.price) * item.quantity)}
                          </Typography>
                          {offer && (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                              <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                {formatCurrency(item.price * item.quantity)}
                              </Typography>
                              <Chip label={`${offer.discountPercentage}% OFF`} color="success" size="small" />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">{formatCurrency(discountedTotal)}</Typography>
              </Box>
              {totalDiscount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="success.main">Discount Applied</Typography>
                  <Typography variant="body2" color="success.main">-{formatCurrency(totalDiscount)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Shipping</Typography>
                <Typography variant="body2">{formatCurrency(shipping)}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">{formatCurrency(finalTotal)}</Typography>
              </Box>
            </Paper>

            <Button type="submit" variant="contained" size="large" fullWidth>
              Place Order
            </Button>
          </Form>
        )}
      </Formik>
      
      {showPayFast && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}>
            <Button 
              onClick={() => setShowPayFast(false)}
              sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10000, minWidth: 'auto', p: 1 }}
            >
              ✕
            </Button>
            <PayFastPayment 
              orderTotal={finalTotal}
              originalTotal={subtotal + shipping}
              discount={totalDiscount}
              onPaymentSubmit={handlePayFastPayment}
              loading={paymentLoading}
            />
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Checkout;
