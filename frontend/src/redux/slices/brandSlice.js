import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Get all brands
export const getBrands = createAsyncThunk(
  'brands/getBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/brands`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch brands');
    }
  }
);

// Add brand
export const addBrand = createAsyncThunk(
  'brands/addBrand',
  async (brandData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/brands`, brandData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add brand');
    }
  }
);

// Delete brand
export const deleteBrand = createAsyncThunk(
  'brands/deleteBrand',
  async (brandId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/brands/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return brandId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete brand');
    }
  }
);

const brandSlice = createSlice({
  name: 'brands',
  initialState: {
    brands: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload;
      })
      .addCase(getBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addBrand.fulfilled, (state, action) => {
        state.brands.push(action.payload);
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.brands = state.brands.filter(brand => brand._id !== action.payload);
      });
  }
});

export const { clearError } = brandSlice.actions;
export default brandSlice.reducer;