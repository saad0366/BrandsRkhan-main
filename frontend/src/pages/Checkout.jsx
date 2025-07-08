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

const Checkout = () => {
  const dispatch = useDispatch();
  const { items, totalPrice, discount, total } = useSelector(state => state.cart);
  const { available: offers } = useSelector(state => state.offers);
  const shipping = 10; // Flat shipping for now
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getActiveOffers());
  }, [dispatch]);

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

  // Helper to get best applicable offer for a product
  const getApplicableOffer = (product) => {
    if (!offers || offers.length === 0) return null;
    return offers
      .filter(offer =>
        (offer.applicableProducts && offer.applicableProducts.includes(product.product)) ||
        (offer.applicableCategories && offer.applicableCategories.includes(product.category))
      )
      .sort((a, b) => b.discountPercentage - a.discountPercentage)[0] || null;
  };

  const handlePlaceOrder = async (values) => {
    try {
      // Calculate offer discount for each item
      let offerDiscount = 0;
      const orderItems = items.map(item => {
        const offer = getApplicableOffer(item);
        const discountedPrice = offer ? item.price * (1 - offer.discountPercentage / 100) : item.price;
        if (offer) {
          offerDiscount += (item.price - discountedPrice) * item.quantity;
        }
        return {
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          discountedPrice,
        };
      });
      const finalTotal = totalPrice + shipping - offerDiscount;
      const orderData = {
        orderItems,
        shippingAddress: {
          address: values.address,
          city: values.city,
          postalCode: values.postalCode,
          country: values.country,
        },
        paymentMethod: values.paymentMethod,
        itemsPrice: totalPrice,
        shippingPrice: shipping,
        discount: offerDiscount,
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
              <Grid container spacing={2}>
                {items.map((item, idx) => {
                  const offer = getApplicableOffer(item);
                  const discountedPrice = offer ? item.price * (1 - offer.discountPercentage / 100) : item.price;
                  return (
                    <Grid item xs={12} key={item.product}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Qty: {item.quantity}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          {offer ? (
                            <>
                              <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                {formatCurrency(item.price)}
                              </Typography>
                              <Typography variant="h6" color="success.main" fontWeight={700}>
                                {formatCurrency(discountedPrice)}
                              </Typography>
                              <Chip label={`-${offer.discountPercentage}%`} color="success" size="small" sx={{ ml: 1 }} />
                            </>
                          ) : (
                            <Typography variant="h6" color="primary" fontWeight={700}>
                              {formatCurrency(item.price)}
                            </Typography>
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
                <Typography variant="body2">{formatCurrency(totalPrice)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Discount</Typography>
                <Typography variant="body2" color="success.main">- {formatCurrency(offerDiscount)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Shipping</Typography>
                <Typography variant="body2">{formatCurrency(shipping)}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">{formatCurrency(totalPrice + shipping - offerDiscount)}</Typography>
              </Box>
            </Paper>

            <Button type="submit" variant="contained" size="large" fullWidth>
              Place Order
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default Checkout;
