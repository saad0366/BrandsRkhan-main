import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../redux/slices/orderSlice';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Box,
  Avatar,
  Pagination,
  Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const getStatusChip = (order) => {
  if (order.isPaid) return <Chip label="Paid" color="success" size="small" />;
  return <Chip label="Pending" color="warning" size="small" />;
};

const UserOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myOrders, loading, error, page = 1, pages = 1 } = useSelector(state => state.orders);
  const [currentPage, setCurrentPage] = useState(page);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchMyOrders({ page: currentPage }));
  }, [dispatch, currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress size={60} /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>My Orders</Typography>
      {myOrders.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <ShoppingCartIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6">No orders yet</Typography>
            <Typography variant="body2" color="text.secondary">You haven't placed any orders yet.</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/products')}>Start Shopping</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {myOrders.map(order => (
              <Grid item xs={12} key={order._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6">Order #{order._id.slice(-8).toUpperCase()}</Typography>
                        <Typography variant="body2" color="text.secondary">Placed on {new Date(order.createdAt).toLocaleDateString()}</Typography>
                        <Typography variant="body2">Total: ${order.totalPrice.toFixed(2)}</Typography>
                        <Typography variant="body2">Payment: {order.paymentMethod}</Typography>
                        {getStatusChip(order)}
                      </Box>
                      <Box>
                        <Button variant="outlined" onClick={() => navigate(`/orders/${order._id}`)}>View</Button>
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
              page={currentPage}
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

export default UserOrders; 