import { describe, it, expect } from 'vitest';
import expensesReducer, {
  addExpense,
  deleteExpense,
  addSettlement
} from './expensesSlice';
import { Expense, Settlement } from '@/types';

describe('expensesSlice', () => {
  const sampleExpense: Expense = {
    id: 'e1',
    groupId: 'g1',
    title: 'Pizza Dinner',
    amount: 50,
    category: 'food',
    date: new Date().toISOString(),
    paidById: 'u1',
    splitType: 'equal',
    splits: [
      { memberId: 'u1', amount: 25 },
      { memberId: 'u2', amount: 25 }
    ],
    createdAt: new Date().toISOString(),
    createdBy: 'u1'
  };

  const sampleSettlement: Settlement = {
    id: 's1',
    groupId: 'g1',
    payerId: 'u2',
    receiverId: 'u1',
    amount: 25,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    createdBy: 'u2'
  };

  it('handles addExpense', () => {
    const state = expensesReducer(
      { expenses: [], settlements: [], filterCategory: 'all' },
      addExpense(sampleExpense)
    );
    expect(state.expenses).toHaveLength(1);
    expect(state.expenses[0].title).toBe('Pizza Dinner');
  });

  it('handles deleteExpense', () => {
    const startState = {
      expenses: [sampleExpense],
      settlements: [],
      filterCategory: 'all'
    };
    const state = expensesReducer(startState, deleteExpense('e1'));
    expect(state.expenses).toHaveLength(0);
  });

  it('handles addSettlement', () => {
    const state = expensesReducer(
      { expenses: [], settlements: [], filterCategory: 'all' },
      addSettlement(sampleSettlement)
    );
    expect(state.settlements).toHaveLength(1);
    expect(state.settlements[0].amount).toBe(25);
  });
});
