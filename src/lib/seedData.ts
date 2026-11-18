import { UserProfile, Group, Expense, Settlement, Contact } from '@/types';

export const CURRENT_USER: UserProfile = {
  id: 'usr_alex',
  name: 'Alex Rivers',
  email: 'alex.rivers@example.com',
  phone: '9876543210',
  avatarUrl: '',
  defaultCurrency: 'INR',
  createdAt: new Date('2026-01-01').toISOString()
};

export const SEED_CONTACTS: Contact[] = [
  {
    id: 'cnt_priya',
    name: 'Priya Sharma',
    phone: '9876543211',
    email: 'priya@example.com',
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 'cnt_rahul',
    name: 'Rahul Verma',
    phone: '9876543212',
    email: 'rahul@example.com',
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 'cnt_sneha',
    name: 'Sneha Patel',
    phone: '9876543213',
    email: 'sneha@example.com',
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 'cnt_david',
    name: 'David Miller',
    phone: '9876543214',
    email: 'david@example.com',
    createdAt: new Date('2026-01-01').toISOString()
  }
];

export const SEED_GROUPS: Group[] = [
  {
    id: 'grp_goa',
    name: 'Goa Trip 🏖️',
    category: 'trip',
    description: 'Beach getaway with college friends',
    inviteCode: 'GOA-4821',
    currency: 'INR',
    createdBy: 'usr_alex',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    memberIds: ['usr_alex', 'usr_priya', 'usr_rahul', 'usr_sneha'],
    members: [
      { id: 'usr_alex', name: 'Alex Rivers', phone: '9876543210', email: 'alex.rivers@example.com' },
      { id: 'usr_priya', name: 'Priya Sharma', phone: '9876543211', email: 'priya@example.com' },
      { id: 'usr_rahul', name: 'Rahul Verma', phone: '9876543212', email: 'rahul@example.com' },
      { id: 'usr_sneha', name: 'Sneha Patel', phone: '9876543213', email: 'sneha@example.com' }
    ]
  },
  {
    id: 'grp_flat',
    name: 'Flat 402 Expenses 🏠',
    category: 'home',
    description: 'Rent, WiFi, groceries and utilities',
    inviteCode: 'FLT-9104',
    currency: 'INR',
    createdBy: 'usr_alex',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    memberIds: ['usr_alex', 'usr_david', 'usr_rahul'],
    members: [
      { id: 'usr_alex', name: 'Alex Rivers', phone: '9876543210', email: 'alex.rivers@example.com' },
      { id: 'usr_david', name: 'David Miller', phone: '9876543214', email: 'david@example.com' },
      { id: 'usr_rahul', name: 'Rahul Verma', phone: '9876543212', email: 'rahul@example.com' }
    ]
  },
  {
    id: 'grp_dinner',
    name: 'Weekend Dinner 🍕',
    category: 'party',
    description: 'Italian dinner and drinks celebration',
    inviteCode: 'DIN-3392',
    currency: 'INR',
    createdBy: 'usr_priya',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    memberIds: ['usr_alex', 'usr_priya', 'usr_david'],
    members: [
      { id: 'usr_alex', name: 'Alex Rivers', phone: '9876543210', email: 'alex.rivers@example.com' },
      { id: 'usr_priya', name: 'Priya Sharma', phone: '9876543211', email: 'priya@example.com' },
      { id: 'usr_david', name: 'David Miller', phone: '9876543214', email: 'david@example.com' }
    ]
  }
];

export const SEED_EXPENSES: Expense[] = [
  // Goa Trip Expenses
  {
    id: 'exp_1',
    groupId: 'grp_goa',
    title: 'Beachfront Villa Booking',
    amount: 16000,
    category: 'stay',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    paidById: 'usr_alex',
    splitType: 'equal',
    splits: [
      { memberId: 'usr_alex', amount: 4000 },
      { memberId: 'usr_priya', amount: 4000 },
      { memberId: 'usr_rahul', amount: 4000 },
      { memberId: 'usr_sneha', amount: 4000 }
    ],
    notes: '3 nights stay near Anjuna beach',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdBy: 'usr_alex'
  },
  {
    id: 'exp_2',
    groupId: 'grp_goa',
    title: 'Scuba Diving & Water Sports',
    amount: 8000,
    category: 'entertainment',
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    paidById: 'usr_priya',
    splitType: 'equal',
    splits: [
      { memberId: 'usr_alex', amount: 2000 },
      { memberId: 'usr_priya', amount: 2000 },
      { memberId: 'usr_rahul', amount: 2000 },
      { memberId: 'usr_sneha', amount: 2000 }
    ],
    notes: 'Grande Island package',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    createdBy: 'usr_priya'
  },
  {
    id: 'exp_3',
    groupId: 'grp_goa',
    title: 'Seafood Dinner at Curlies',
    amount: 4800,
    category: 'food',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    paidById: 'usr_rahul',
    splitType: 'equal',
    splits: [
      { memberId: 'usr_alex', amount: 1200 },
      { memberId: 'usr_priya', amount: 1200 },
      { memberId: 'usr_rahul', amount: 1200 },
      { memberId: 'usr_sneha', amount: 1200 }
    ],
    notes: 'Sunset dinner and drinks',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    createdBy: 'usr_rahul'
  },
  {
    id: 'exp_4',
    groupId: 'grp_goa',
    title: 'Scooter Fuel & Rentals',
    amount: 2200,
    category: 'transport',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    paidById: 'usr_sneha',
    splitType: 'exact',
    splits: [
      { memberId: 'usr_alex', amount: 1100 },
      { memberId: 'usr_sneha', amount: 1100 }
    ],
    notes: '2 Honda Activas for 3 days',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdBy: 'usr_sneha'
  },

  // Flat Expenses
  {
    id: 'exp_5',
    groupId: 'grp_flat',
    title: 'Fiber Internet 300 Mbps',
    amount: 1499,
    category: 'utilities',
    date: new Date(Date.now() - 10 * 86400000).toISOString(),
    paidById: 'usr_david',
    splitType: 'equal',
    splits: [
      { memberId: 'usr_alex', amount: 499.66 },
      { memberId: 'usr_david', amount: 499.67 },
      { memberId: 'usr_rahul', amount: 499.67 }
    ],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    createdBy: 'usr_david'
  },
  {
    id: 'exp_6',
    groupId: 'grp_flat',
    title: 'Monthly Groceries & Pantry',
    amount: 4500,
    category: 'groceries',
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    paidById: 'usr_alex',
    splitType: 'equal',
    splits: [
      { memberId: 'usr_alex', amount: 1500 },
      { memberId: 'usr_david', amount: 1500 },
      { memberId: 'usr_rahul', amount: 1500 }
    ],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    createdBy: 'usr_alex'
  },

  // Weekend Dinner
  {
    id: 'exp_7',
    groupId: 'grp_dinner',
    title: 'Gourmet Pizzas & Pasta',
    amount: 3200,
    category: 'food',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    paidById: 'usr_alex',
    splitType: 'equal',
    splits: [
      { memberId: 'usr_alex', amount: 1066.66 },
      { memberId: 'usr_priya', amount: 1066.67 },
      { memberId: 'usr_david', amount: 1066.67 }
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdBy: 'usr_alex'
  }
];

export const SEED_SETTLEMENTS: Settlement[] = [
  {
    id: 'stl_1',
    groupId: 'grp_goa',
    payerId: 'usr_rahul',
    receiverId: 'usr_alex',
    amount: 2500,
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: 'UPI transfer for Goa trip stay',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdBy: 'usr_rahul'
  }
];
