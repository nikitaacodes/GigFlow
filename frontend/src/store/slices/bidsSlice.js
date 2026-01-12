import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const createBid = createAsyncThunk(
  'bids/createBid',
  async (bidData, { rejectWithValue }) => {
    try {
      const response = await api.post('/bids', bidData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create bid'
      );
    }
  }
);

export const fetchMyBids = createAsyncThunk(
  'bids/fetchMyBids',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/bids/my-bids');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch your bids'
      );
    }
  }
);

export const fetchBidsByGig = createAsyncThunk(
  'bids/fetchBidsByGig',
  async (gigId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bids/${gigId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch bids'
      );
    }
  }
);

export const updateBid = createAsyncThunk(
  'bids/updateBid',
  async ({ bidId, bidData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/bids/${bidId}`, bidData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update bid'
      );
    }
  }
);

export const deleteBid = createAsyncThunk(
  'bids/deleteBid',
  async (bidId, { rejectWithValue }) => {
    try {
      await api.delete(`/bids/${bidId}`);
      return bidId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete bid'
      );
    }
  }
);

export const hireBid = createAsyncThunk(
  'bids/hireBid',
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/bids/${bidId}/hire`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to hire freelancer'
      );
    }
  }
);

const initialState = {
  myBids: [],
  bidsByGig: {},
  loading: false,
  error: null,
};

const bidsSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBidsByGig: (state, action) => {
      delete state.bidsByGig[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Bid
      .addCase(createBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBid.fulfilled, (state, action) => {
        state.loading = false;
        const gigId = action.payload.gig._id || action.payload.gig;
        if (!state.bidsByGig[gigId]) {
          state.bidsByGig[gigId] = [];
        }
        state.bidsByGig[gigId].unshift(action.payload);
        state.myBids.unshift(action.payload);
      })
      .addCase(createBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My Bids
      .addCase(fetchMyBids.fulfilled, (state, action) => {
        state.myBids = action.payload;
      })
      // Fetch Bids By Gig
      .addCase(fetchBidsByGig.fulfilled, (state, action) => {
        const gigId = action.meta.arg;
        state.bidsByGig[gigId] = action.payload;
      })
      // Update Bid
      .addCase(updateBid.fulfilled, (state, action) => {
        const bid = action.payload;
        const gigId = bid.gig._id || bid.gig;
        
        // Update in myBids
        const myBidIndex = state.myBids.findIndex((b) => b._id === bid._id);
        if (myBidIndex !== -1) {
          state.myBids[myBidIndex] = bid;
        }
        
        // Update in bidsByGig
        if (state.bidsByGig[gigId]) {
          const bidIndex = state.bidsByGig[gigId].findIndex((b) => b._id === bid._id);
          if (bidIndex !== -1) {
            state.bidsByGig[gigId][bidIndex] = bid;
          }
        }
      })
      // Delete Bid
      .addCase(deleteBid.fulfilled, (state, action) => {
        state.myBids = state.myBids.filter((b) => b._id !== action.payload);
        // Remove from bidsByGig
        Object.keys(state.bidsByGig).forEach((gigId) => {
          state.bidsByGig[gigId] = state.bidsByGig[gigId].filter(
            (b) => b._id !== action.payload
          );
        });
      })
      // Hire Bid
      .addCase(hireBid.fulfilled, (state, action) => {
        const { gig, bid } = action.payload;
        const gigId = gig._id;
        
        // Update bids in bidsByGig
        if (state.bidsByGig[gigId]) {
          state.bidsByGig[gigId] = state.bidsByGig[gigId].map((b) =>
            b._id === bid._id
              ? { ...b, status: 'hired' }
              : b.status === 'pending'
              ? { ...b, status: 'rejected' }
              : b
          );
        }
        
        // Update in myBids if it exists
        const myBidIndex = state.myBids.findIndex((b) => b._id === bid._id);
        if (myBidIndex !== -1) {
          state.myBids[myBidIndex] = { ...state.myBids[myBidIndex], status: 'hired' };
        }
      });
  },
});

export const { clearError, clearBidsByGig } = bidsSlice.actions;
export default bidsSlice.reducer;
