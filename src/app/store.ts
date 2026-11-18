import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import groupsReducer from '@/features/groups/groupsSlice';
import expensesReducer from '@/features/expenses/expensesSlice';
import { splitwiseApi } from '@/features/api/splitwiseApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupsReducer,
    expenses: expensesReducer,
    [splitwiseApi.reducerPath]: splitwiseApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(splitwiseApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
