import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { hireBid } from './bidsSlice';

// Async thunks
export const fetchGigs = createAsyncThunk(
  'gigs/fetchGigs',
  async ({ status, category, search } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      params.append('status', status || '');

      const response = await api.get(`/gigs?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch gigs'
      );
    }
  }
);

export const fetchGig = createAsyncThunk(
  'gigs/fetchGig',
  async (gigId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/gigs/${gigId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch gig'
      );
    }
  }
);

export const createGig = createAsyncThunk(
  'gigs/createGig',
  async (gigData, { rejectWithValue }) => {
    try {
      const response = await api.post('/gigs', gigData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create gig'
      );
    }
  }
);

export const updateGig = createAsyncThunk(
  'gigs/updateGig',
  async ({ gigId, gigData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/gigs/${gigId}`, gigData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update gig'
      );
    }
  }
);

export const deleteGig = createAsyncThunk(
  'gigs/deleteGig',
  async (gigId, { rejectWithValue }) => {
    try {
      await api.delete(`/gigs/${gigId}`);
      return gigId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete gig'
      );
    }
  }
);

export const fetchMyGigs = createAsyncThunk(
  'gigs/fetchMyGigs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/gigs/my-gigs');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch your gigs'
      );
    }
  }
);

// Note: hireBid is now in bidsSlice since it's PATCH /api/bids/:bidId/hire

const initialState = {
  gigs: [],
  currentGig: null,
  myGigs: [],
  loading: false,
  error: null,
};

const gigsSlice = createSlice({
  name: 'gigs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGig: (state) => {
      state.currentGig = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Gigs
      .addCase(fetchGigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.loading = false;
        state.gigs = action.payload;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Gig
      .addCase(fetchGig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGig.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGig = action.payload;
      })
      .addCase(fetchGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Gig
      .addCase(createGig.fulfilled, (state, action) => {
        state.gigs.unshift(action.payload);
        state.myGigs.unshift(action.payload);
      })
      // Update Gig
      .addCase(updateGig.fulfilled, (state, action) => {
        const index = state.gigs.findIndex((g) => g._id === action.payload._id);
        if (index !== -1) {
          state.gigs[index] = action.payload;
        }
        const myIndex = state.myGigs.findIndex((g) => g._id === action.payload._id);
        if (myIndex !== -1) {
          state.myGigs[myIndex] = action.payload;
        }
        if (state.currentGig && state.currentGig.gig._id === action.payload._id) {
          state.currentGig.gig = action.payload;
        }
      })
      // Delete Gig
      .addCase(deleteGig.fulfilled, (state, action) => {
        state.gigs = state.gigs.filter((g) => g._id !== action.payload);
        state.myGigs = state.myGigs.filter((g) => g._id !== action.payload);
        if (state.currentGig && state.currentGig.gig._id === action.payload) {
          state.currentGig = null;
        }
      })
      // Fetch My Gigs
      .addCase(fetchMyGigs.fulfilled, (state, action) => {
        state.myGigs = action.payload;
      })
      // Hire Bid
      .addCase(hireBid.fulfilled, (state, action) => {
        const { gig, bid } = action.payload;
        // Update current gig if it's the one being updated
        if (state.currentGig && state.currentGig.gig._id === gig._id) {
          state.currentGig.gig = gig;
          // Update bids in current gig
          if (state.currentGig.bids) {
            state.currentGig.bids = state.currentGig.bids.map((b) =>
              b._id === bid._id
                ? { ...b, status: 'hired' }
                : b.status === 'pending'
                ? { ...b, status: 'rejected' }
                : b
            );
          }
        }
        // Update in gigs list
        const gigIndex = state.gigs.findIndex((g) => g._id === gig._id);
        if (gigIndex !== -1) {
          state.gigs[gigIndex] = gig;
        }
        // Update in myGigs
        const myGigIndex = state.myGigs.findIndex((g) => g._id === gig._id);
        if (myGigIndex !== -1) {
          state.myGigs[myGigIndex] = gig;
        }
      });
  },
});

export const { clearError, clearCurrentGig } = gigsSlice.actions;
export default gigsSlice.reducer;
