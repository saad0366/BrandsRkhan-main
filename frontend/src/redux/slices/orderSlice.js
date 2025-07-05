import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as orderApi from '../../api/orderAPI';

export const placeOrder = createAsyncThunk('orders/placeOrder', async (orderData, { rejectWithValue }) => {
  try {
    const response = await orderApi.placeOrder(orderData);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Order placement failed');
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMyOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await orderApi.fetchMyOrders();
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch orders');
  }
});

export const fetchOrderById = createAsyncThunk('orders/fetchOrderById', async (id, { rejectWithValue }) => {
  try {
    const response = await orderApi.fetchOrderById(id);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch order');
  }
});

export const fetchAllOrders = createAsyncThunk('orders/fetchAllOrders', async (params, { rejectWithValue }) => {
  try {
    const response = await orderApi.fetchAllOrders(params);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch all orders');
  }
});

export const cancelOrder = createAsyncThunk('orders/cancelOrder', async (id, { rejectWithValue }) => {
  try {
    const response = await orderApi.cancelOrder(id);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to cancel order');
  }
});

export const reorder = createAsyncThunk('orders/reorder', async (id, { rejectWithValue }) => {
  try {
    const response = await orderApi.reorder(id);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to reorder');
  }
});

export const updateOrderStatus = createAsyncThunk('orders/updateOrderStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await orderApi.updateOrderStatus(id, status);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update order status');
  }
});

export const fetchOrderStats = createAsyncThunk('orders/fetchOrderStats', async (_, { rejectWithValue }) => {
  try {
    const response = await orderApi.fetchOrderStats();
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch order stats');
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    myOrders: [],
    selectedOrder: null,
    loading: false,
    error: null,
    total: 0,
    page: 1,
    pages: 1,
    stats: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.selectedOrder = { ...state.selectedOrder, status: 'cancelled' };
      })
      .addCase(reorder.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError } = orderSlice.actions;
export default orderSlice.reducer;
export { fetchAllOrders as getAllOrders, fetchOrderStats as getOrderStats };
export { placeOrder as createOrder, fetchMyOrders as getMyOrders }; 