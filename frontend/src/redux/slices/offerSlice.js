import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchOffers, 
  applyOfferCode, 
  getActiveOffers as fetchActiveOffers, 
  getAllOffers as fetchAllOffers, 
  createOffer, 
  updateOffer, 
  deleteOffer, 
  searchOffer 
} from '../../api/offerAPI';

// Get active offers for users
export const getActiveOffers = createAsyncThunk(
  'offers/getActiveOffers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchActiveOffers();
      // Handle both axios response format and direct data
      return response.data || response;
    } catch (error) {
      console.error('Error fetching active offers:', error);
      // Return empty array instead of rejecting to prevent app crash
      return [];
    }
  }
);

// Get all offers for admin
export const getAllOffers = createAsyncThunk(
  'offers/getAllOffers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAllOffers();
      // Always return the data array, not the whole response object
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching all offers:', error);
      // Return empty array instead of rejecting to prevent app crash
      return [];
    }
  }
);

// Create new offer
export const createNewOffer = createAsyncThunk(
  'offers/createOffer',
  async (offerData, { rejectWithValue }) => {
    try {
      const response = await createOffer(offerData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create offer');
    }
  }
);

// Update offer
export const updateExistingOffer = createAsyncThunk(
  'offers/updateOffer',
  async ({ id, offerData }, { rejectWithValue }) => {
    try {
      const response = await updateOffer(id, offerData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update offer');
    }
  }
);

// Delete offer
export const deleteExistingOffer = createAsyncThunk(
  'offers/deleteOffer',
  async (id, { rejectWithValue }) => {
    try {
      await deleteOffer(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete offer');
    }
  }
);

// Search offer by ID
export const searchOfferById = createAsyncThunk(
  'offers/searchOffer',
  async (id, { rejectWithValue }) => {
    try {
      const response = await searchOffer(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search offer');
    }
  }
);

// Legacy functions for backward compatibility
export const getOffers = createAsyncThunk(
  'offers/getOffers',
  async (_, { rejectWithValue }) => {
    try {
    const response = await fetchOffers();
      // Handle both axios response format and direct data
      return response.data || response;
    } catch (error) {
      console.error('Error fetching offers:', error);
      // Return empty array instead of rejecting to prevent app crash
      return [];
    }
  }
);

export const applyOffer = createAsyncThunk(
  'offers/applyOffer',
  async (offerCode, { rejectWithValue }) => {
    try {
      const response = await applyOfferCode(offerCode);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply offer');
    }
  }
);

const initialState = {
  available: [],
  allOffers: [],
  applied: [],
  loading: false,
  error: null,
  selectedOffer: null,
};

const offerSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedOffer: (state) => {
      state.selectedOffer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Active Offers
      .addCase(getActiveOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.available = action.payload || [];
      })
      .addCase(getActiveOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch offers';
        state.available = [];
      })
      // Get All Offers (Admin)
      .addCase(getAllOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.allOffers = action.payload || [];
      })
      .addCase(getAllOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch offers';
        state.allOffers = [];
      })
      // Create Offer
      .addCase(createNewOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewOffer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.allOffers.push(action.payload);
        }
      })
      .addCase(createNewOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create offer';
      })
      // Update Offer
      .addCase(updateExistingOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingOffer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.allOffers.findIndex(offer => offer._id === action.payload._id);
          if (index !== -1) {
            state.allOffers[index] = action.payload;
          }
        }
      })
      .addCase(updateExistingOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update offer';
      })
      // Delete Offer
      .addCase(deleteExistingOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingOffer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.allOffers = state.allOffers.filter(offer => offer._id !== action.payload);
        }
      })
      .addCase(deleteExistingOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete offer';
      })
      // Search Offer
      .addCase(searchOfferById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchOfferById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOffer = action.payload || null;
      })
      .addCase(searchOfferById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to search offer';
        state.selectedOffer = null;
      })
      // Legacy: Get Offers
      .addCase(getOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.available = action.payload || [];
      })
      .addCase(getOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch offers';
        state.available = [];
      })
      // Legacy: Apply Offer
      .addCase(applyOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyOffer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
        state.applied.push(action.payload);
        }
      })
      .addCase(applyOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to apply offer';
      });
  },
});

export const { clearError, clearSelectedOffer } = offerSlice.actions;
export default offerSlice.reducer;