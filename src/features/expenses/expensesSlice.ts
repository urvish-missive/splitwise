import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Expense, Settlement } from '@/types';
import { SEED_EXPENSES, SEED_SETTLEMENTS } from '@/lib/seedData';

interface ExpensesState {
  expenses: Expense[];
  settlements: Settlement[];
  filterCategory: string;
}

const EXPENSES_STORAGE_KEY = 'splitwise_expenses';
const SETTLEMENTS_STORAGE_KEY = 'splitwise_settlements';

const loadInitialExpenses = (): Expense[] => {
  try {
    const data = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load expenses from storage', e);
  }
  return SEED_EXPENSES;
};

const loadInitialSettlements = (): Settlement[] => {
  try {
    const data = localStorage.getItem(SETTLEMENTS_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load settlements from storage', e);
  }
  return SEED_SETTLEMENTS;
};

const initialState: ExpensesState = {
  expenses: loadInitialExpenses(),
  settlements: loadInitialSettlements(),
  filterCategory: 'all'
};

export const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload;
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(action.payload));
    },
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift(action.payload);
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(state.expenses));
    },
    updateExpense: (state, action: PayloadAction<Expense>) => {
      const idx = state.expenses.findIndex((e) => e.id === action.payload.id);
      if (idx !== -1) {
        state.expenses[idx] = action.payload;
        localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(state.expenses));
      }
    },
    deleteExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(state.expenses));
    },
    setSettlements: (state, action: PayloadAction<Settlement[]>) => {
      state.settlements = action.payload;
      localStorage.setItem(SETTLEMENTS_STORAGE_KEY, JSON.stringify(action.payload));
    },
    addSettlement: (state, action: PayloadAction<Settlement>) => {
      state.settlements.unshift(action.payload);
      localStorage.setItem(SETTLEMENTS_STORAGE_KEY, JSON.stringify(state.settlements));
    },
    deleteSettlement: (state, action: PayloadAction<string>) => {
      state.settlements = state.settlements.filter((s) => s.id !== action.payload);
      localStorage.setItem(SETTLEMENTS_STORAGE_KEY, JSON.stringify(state.settlements));
    },
    setFilterCategory: (state, action: PayloadAction<string>) => {
      state.filterCategory = action.payload;
    },
    resetToDemoData: (state) => {
      state.expenses = SEED_EXPENSES;
      state.settlements = SEED_SETTLEMENTS;
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(SEED_EXPENSES));
      localStorage.setItem(SETTLEMENTS_STORAGE_KEY, JSON.stringify(SEED_SETTLEMENTS));
    }
  }
});

export const {
  setExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  setSettlements,
  addSettlement,
  deleteSettlement,
  setFilterCategory,
  resetToDemoData
} = expensesSlice.actions;

export default expensesSlice.reducer;
