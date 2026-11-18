import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, CurrencyCode } from '@/types';
import { CURRENT_USER } from '@/lib/seedData';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
}

const STORAGE_KEY = 'splitwise_user_profile';

const loadStoredUser = (): UserProfile => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load user profile from storage', e);
  }
  return CURRENT_USER;
};

const initialState: AuthState = {
  user: loadStoredUser(),
  isLoading: false,
  isAuthenticated: true,
  isDemoMode: true
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    updateCurrency: (state, action: PayloadAction<CurrencyCode>) => {
      if (state.user) {
        state.user.defaultCurrency = action.payload;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
      }
    },
    updateName: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.name = action.payload;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
      }
    },
    updatePhone: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.phone = action.payload;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setDemoMode: (state, action: PayloadAction<boolean>) => {
      state.isDemoMode = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem(STORAGE_KEY);
    }
  }
});

export const { setUser, updateCurrency, updateName, updatePhone, setLoading, setDemoMode, logout } =
  authSlice.actions;

export default authSlice.reducer;
