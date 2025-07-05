import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../redux/slices/orderSlice';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Pagination,
  Stack
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const getStatusChip = (order) => {
  if (order.status === 'cancelled') return <Chip label="Cancelled" color="error" size="small" />;
  if (order.isPaid) return <Chip label="Paid" color="success" size="small" />;
  return <Chip label="Pending" color="warning" size="small" />;
};

const AdminOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error, total, page, pages } = useSelector(state => state.orders);
  const [filters, setFilters] = useState({ status: '', search: '', page: 1 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [statusLoading, setStatusLoading] = useState(null);

  useEffect(() => {
    dispatch(fetchAllOrders(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handlePageChange = (event, value) => {
    setFilters({ ...filters, page: value });
  };

  const handleStatusUpdate = async (orderId, status) => {
    setStatusLoading(orderId + status);
    try {
      await dispatch(updateOrderStatus({ id: orderId, status })).unwrap();
      setSnackbar({ open: true, message: `Order marked as ${status}`, severity: 'success' });
      dispatch(fetchAllOrders(filters));
    } catch (err) {
      setSnackbar({ open: true, message: err || 'Failed to update status', severity: 'error' });
    } finally {
      setStatusLoading(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>All Orders (Admin)</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={filters.status}
            label="Status"
            onChange={handleFilterChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        <TextField
          name="search"
          label="Search by user/email"
          value={filters.search}
          onChange={handleFilterChange}
          size="small"
        />
      </Stack>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress size={60} /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      ) : orders.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <Typography variant="h6">No orders found</Typography>
            <Typography variant="body2" color="text.secondary">No orders have been placed yet.</Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {orders.map(order => (
              <Grid item xs={12} key={order._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6">Order #{order._id.slice(-8).toUpperCase()}</Typography>
                        <Typography variant="body2" color="text.secondary">Placed on {new Date(order.createdAt).toLocaleDateString()}</Typography>
                        <Typography variant="body2">Total: ${order.totalPrice.toFixed(2)}</Typography>
                        <Typography variant="body2">User: {order.user?.name} ({order.user?.email})</Typography>
                        {getStatusChip(order)}
                      </Box>
                      <Box>
                        <Button variant="outlined" onClick={() => navigate(`/orders/${order._id}`)}>View</Button>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          sx={{ ml: 1 }}
                          disabled={order.isPaid || statusLoading === order._id + 'paid'}
                          onClick={() => handleStatusUpdate(order._id, 'paid')}
                        >
                          {statusLoading === order._id + 'paid' ? <CircularProgress size={18} /> : 'Mark as Paid'}
                        </Button>
                        <Button
                          variant="contained"
                          color="info"
                          size="small"
                          sx={{ ml: 1 }}
                          disabled={order.isDelivered || statusLoading === order._id + 'delivered'}
                          onClick={() => handleStatusUpdate(order._id, 'delivered')}
                        >
                          {statusLoading === order._id + 'delivered' ? <CircularProgress size={18} /> : 'Mark as Delivered'}
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pages}
              page={filters.page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
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

export default AdminOrders; 