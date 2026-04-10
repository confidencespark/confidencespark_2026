import {configureStore} from '@reduxjs/toolkit';
import {authApi} from './api/authApi';
import {confidenceApi} from './api/confidenceApi';
import authSlice from './slices/authSlice';
import appSlice from './slices/appSlice';

export const store = configureStore({
  reducer: {
    // Global Auth State (Token, Authenticated status)
    auth: authSlice,
    // App specific state (Loaders, etc.)
    app: appSlice,

    // RTK Query API Reducers
    [authApi.reducerPath]: authApi.reducer,
    [confidenceApi.reducerPath]: confidenceApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(authApi.middleware, confidenceApi.middleware),
});
// ConfidenceSpark workspace batch
