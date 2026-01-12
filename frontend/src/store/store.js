import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gigsReducer from './slices/gigsSlice';
import bidsReducer from './slices/bidsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gigs: gigsReducer,
    bids: bidsReducer,
  },
});
