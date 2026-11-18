import { UserProfile, Group, Expense, Settlement, Contact } from '@/types';

export const CURRENT_USER: UserProfile = {
  id: 'usr_me',
  name: 'My Account',
  phone: '',
  defaultCurrency: 'INR',
  createdAt: new Date().toISOString()
};

export const SEED_CONTACTS: Contact[] = [];

export const SEED_GROUPS: Group[] = [];

export const SEED_EXPENSES: Expense[] = [];

export const SEED_SETTLEMENTS: Settlement[] = [];
