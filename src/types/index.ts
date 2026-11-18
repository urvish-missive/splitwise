export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'SGD' | 'AED';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  pin?: string;
  avatarUrl?: string;
  defaultCurrency: CurrencyCode;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type GroupCategory = 'trip' | 'home' | 'couple' | 'party' | 'office' | 'other';

export interface GroupMember {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  isRegistered?: boolean;
}

export interface Group {
  id: string;
  name: string;
  category: GroupCategory;
  description?: string;
  inviteCode: string;
  currency: CurrencyCode;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memberIds: string[];
  memberPhones?: string[];
  members: GroupMember[];
}

export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'stay'
  | 'entertainment'
  | 'groceries'
  | 'shopping'
  | 'utilities'
  | 'general';

export interface ExpenseSplit {
  memberId: string;
  amount: number;
  percentage?: number;
  shares?: number;
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO date string
  paidById: string;
  splitType: SplitType;
  splits: ExpenseSplit[];
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  createdBy: string;
}

export interface Settlement {
  id: string;
  groupId: string;
  payerId: string;
  receiverId: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface DebtSimplification {
  fromId: string;
  toId: string;
  amount: number;
}

export interface MemberBalance {
  memberId: string;
  netBalance: number; // positive = owed money (+), negative = owes money (-)
  owesTotal: number;
  owedTotal: number;
}

export interface GroupBalanceCalculation {
  memberBalances: Record<string, MemberBalance>;
  simplifiedDebts: DebtSimplification[];
  totalGroupExpenses: number;
  totalGroupSettlements: number;
}
