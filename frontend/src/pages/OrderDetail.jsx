import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, cancelOrder, reorder } from '../redux/slices/orderSlice';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Box,
  Avatar,
  Button,
  Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const getStatusChip = (order) => {
  if (order.status === 'cancelled') return <Chip label="Cancelled" color="error" size="small" />;
  if (order.isPaid) return <Chip label="Paid" color="success" size="small" />;
  return <Chip label="Pending" color="warning" size="small" />;
};

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedOrder, loading, error } = useSelector(state => state.orders);
  const { user } = useSelector(state => state.auth);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  const handleCancel = async () => {
    setActionLoading('cancel');
    try {
      await dispatch(cancelOrder(id)).unwrap();
      setSnackbar({ open: true, message: 'Order cancelled', severity: 'success' });
      dispatch(fetchOrderById(id));
    } catch (err) {
      setSnackbar({ open: true, message: err || 'Failed to cancel order', severity: 'error' });
    } finally {
      setActionLoading('');
    }
  };

  const handleReorder = async () => {
    setActionLoading('reorder');
    try {
      const newOrder = await dispatch(reorder(id)).unwrap();
      setSnackbar({ open: true, message: 'Order placed again!', severity: 'success' });
      navigate(`/orders/${newOrder._id}`);
    } catch (err) {
      setSnackbar({ open: true, message: err || 'Failed to reorder', severity: 'error' });
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress size={60} /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  if (!selectedOrder) return <Alert severity="info" sx={{ mt: 4 }}>Order not found</Alert>;

  const canCancel = !selectedOrder.isPaid && selectedOrder.status !== 'cancelled';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
          <Card>
            <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Order #{selectedOrder._id.slice(-8).toUpperCase()}</Typography>
            {getStatusChip(selectedOrder)}
                </Box>
          <Typography variant="body2" color="text.secondary">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</Typography>
          <Typography variant="body2">Total: ${selectedOrder.totalPrice.toFixed(2)}</Typography>
          <Typography variant="body2">Payment: {selectedOrder.paymentMethod}</Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <b>Shipping Address:</b> {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}, {selectedOrder.shippingAddress.country}
              </Typography>
          <Typography variant="h6" sx={{ mt: 3 }}>Items</Typography>
          <Grid container spacing={2}>
            {selectedOrder.orderItems.map((item, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Card variant="outlined">
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={item.image} alt={item.name} variant="rounded" sx={{ width: 56, height: 56 }} />
                    <Box>
                      <Typography>{item.name}</Typography>
                      <Typography variant="body2">Qty: {item.quantity}</Typography>
                      <Typography variant="body2">Price: ${item.price.toFixed(2)}</Typography>
                      <Typography variant="body2">Total: ${(item.price * item.quantity).toFixed(2)}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {user?.role === 'admin' && selectedOrder.user && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">User Info</Typography>
              <Typography>Name: {selectedOrder.user.name}</Typography>
              <Typography>Email: {selectedOrder.user.email}</Typography>
            </Box>
          )}
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            {user?.role === 'user' && canCancel && (
          <Button
                variant="contained"
                color="error"
                disabled={actionLoading === 'cancel'}
                onClick={handleCancel}
          >
                {actionLoading === 'cancel' ? <CircularProgress size={18} /> : 'Cancel Order'}
          </Button>
            )}
            {user?.role === 'user' && (
          <Button
            variant="contained"
                color="primary"
                disabled={actionLoading === 'reorder'}
                onClick={handleReorder}
          >
                {actionLoading === 'reorder' ? <CircularProgress size={18} /> : 'Reorder'}
          </Button>
            )}
          </Box>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert elevation={6} variant="filled" severity={snackbar.severity}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default OrderDetail; 