import {createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@constants/storageKeys';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Auth Slice
 *
 * Manages global authentication state.
 *
 * State:
 * - user: Current user object.
 * - token: JWT access token (synced with AsyncStorage).
 * - isAuthenticated: Boolean flag for auth guards.
 *
 * Actions:
 * - setToken: Updates token and persists to storage.
 * - logout: Clears all auth data and storage.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) {
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, String(action.payload));
        state.isAuthenticated = true;
      } else {
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    logout: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      AsyncStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    },
    resetAuth: () => initialState,
  },
});

export const {
  setLoading,
  setUser,
  setToken,
  setError,
  clearError,
  logout,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;
