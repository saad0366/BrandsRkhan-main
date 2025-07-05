import axiosClient from './axiosClient';

export const placeOrder = (orderData) =>
  axiosClient.post('/orders', orderData);

export const fetchMyOrders = () =>
  axiosClient.get('/orders/myorders');

export const fetchOrderById = (id) =>
  axiosClient.get(`/orders/${id}`);

export const fetchAllOrders = (params) =>
  axiosClient.get('/orders', { params });

export const cancelOrder = (id) =>
  axiosClient.patch(`/orders/${id}/cancel`);

export const reorder = (id) =>
  axiosClient.post(`/orders/${id}/reorder`);

export const updateOrderStatus = (id, status) =>
  axiosClient.patch(`/orders/${id}/status`, { status });

export const fetchOrderStats = () =>
  axiosClient.get('/orders/stats'); 