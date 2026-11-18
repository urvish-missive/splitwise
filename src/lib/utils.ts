import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isYesterday } from 'date-fns';
import { CurrencyCode, ExpenseCategory } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: CurrencyCode = 'INR'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const symbols: Record<CurrencyCode, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    AED: 'AED '
  };

  const symbol = symbols[currency] || '₹';
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(absAmount);

  return `${isNegative ? '-' : ''}${symbol}${formattedNumber}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    }
    if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM d');
  } catch {
    return dateString;
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function generateInviteCode(groupName: string): string {
  const prefix = groupName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'GRP';
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${randomSuffix}`;
}

export const CATEGORY_INFO: Record<
  ExpenseCategory,
  { label: string; icon: string; bg: string; text: string }
> = {
  food: { label: 'Food & Dining', icon: 'UtensilsCrossed', bg: 'bg-amber-100', text: 'text-amber-700' },
  transport: { label: 'Transport', icon: 'Car', bg: 'bg-blue-100', text: 'text-blue-700' },
  stay: { label: 'Accommodation', icon: 'Home', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  entertainment: { label: 'Entertainment', icon: 'Film', bg: 'bg-purple-100', text: 'text-purple-700' },
  groceries: { label: 'Groceries', icon: 'ShoppingBag', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  shopping: { label: 'Shopping', icon: 'Tag', bg: 'bg-pink-100', text: 'text-pink-700' },
  utilities: { label: 'Bills & Utilities', icon: 'Zap', bg: 'bg-orange-100', text: 'text-orange-700' },
  general: { label: 'General', icon: 'Receipt', bg: 'bg-slate-100', text: 'text-slate-700' }
};

export const GROUP_CATEGORY_INFO: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  trip: { label: 'Trip & Travel', icon: 'Plane', color: 'text-sky-600 bg-sky-50' },
  home: { label: 'Flat & Roommates', icon: 'Home', color: 'text-emerald-600 bg-emerald-50' },
  couple: { label: 'Couple', icon: 'Heart', color: 'text-rose-600 bg-rose-50' },
  party: { label: 'Party & Event', icon: 'Sparkles', color: 'text-amber-600 bg-amber-50' },
  office: { label: 'Office & Work', icon: 'Briefcase', color: 'text-violet-600 bg-violet-50' },
  other: { label: 'Other', icon: 'Layers', color: 'text-slate-600 bg-slate-50' }
};

/**
 * Normalizes phone numbers for reliable comparison (keeps last 10 digits).
 */
export function normalizePhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Checks if two phone numbers match.
 */
export function isSamePhone(p1?: string, p2?: string): boolean {
  const n1 = normalizePhone(p1);
  const n2 = normalizePhone(p2);
  return !!n1 && !!n2 && n1 === n2;
}

/**
 * Finds the group member matching the current user profile (by ID, phone, or email).
 */
export function findMemberForUser<T extends { id: string; phone?: string; email?: string }>(
  members: T[],
  user?: { id?: string; phone?: string; email?: string } | null
): T | undefined {
  if (!user) return undefined;
  return members.find(
    (m) =>
      (user.id && m.id === user.id) ||
      (user.phone && m.phone && isSamePhone(user.phone, m.phone)) ||
      (user.email && m.email && user.email.toLowerCase() === m.email.toLowerCase())
  );
}

/**
 * Checks if a user is a member of the group (by ID, phone, or email).
 */
export function isUserInGroup<T extends { id: string; phone?: string; email?: string }>(
  members: T[],
  user?: { id?: string; phone?: string; email?: string } | null
): boolean {
  return !!findMemberForUser(members, user);
}

