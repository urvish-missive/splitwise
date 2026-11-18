import { describe, it, expect } from 'vitest';
import { normalizePhone, isSamePhone, findMemberForUser, isUserInGroup } from '@/lib/utils';
import { Group, GroupMember, UserProfile } from '@/types';

const TEST_GROUPS: Group[] = [
  {
    id: 'grp_goa',
    name: 'Goa Trip 🏖️',
    category: 'trip',
    inviteCode: 'GOA-4821',
    currency: 'INR',
    createdBy: 'usr_alex',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    memberIds: ['usr_alex', 'usr_priya', 'usr_rahul', 'usr_sneha'],
    members: [
      { id: 'usr_alex', name: 'Alex Rivers', phone: '9876543210' },
      { id: 'usr_priya', name: 'Priya Sharma', phone: '9876543211' },
      { id: 'usr_rahul', name: 'Rahul Verma', phone: '9876543212' },
      { id: 'usr_sneha', name: 'Sneha Patel', phone: '9876543213' }
    ]
  },
  {
    id: 'grp_flat',
    name: 'Flat 402 Expenses 🏠',
    category: 'home',
    inviteCode: 'FLT-9104',
    currency: 'INR',
    createdBy: 'usr_alex',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    memberIds: ['usr_alex', 'usr_david', 'usr_rahul'],
    members: [
      { id: 'usr_alex', name: 'Alex Rivers', phone: '9876543210' },
      { id: 'usr_david', name: 'David Miller', phone: '9876543214' },
      { id: 'usr_rahul', name: 'Rahul Verma', phone: '9876543212' }
    ]
  },
  {
    id: 'grp_dinner',
    name: 'Weekend Dinner 🍕',
    category: 'party',
    inviteCode: 'DIN-3392',
    currency: 'INR',
    createdBy: 'usr_priya',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    memberIds: ['usr_alex', 'usr_priya', 'usr_david'],
    members: [
      { id: 'usr_alex', name: 'Alex Rivers', phone: '9876543210' },
      { id: 'usr_priya', name: 'Priya Sharma', phone: '9876543211' },
      { id: 'usr_david', name: 'David Miller', phone: '9876543214' }
    ]
  }
];

describe('Phone-based user identification and group filtering', () => {
  it('correctly normalizes phone numbers and checks matching', () => {
    expect(normalizePhone('+91 98765 43212')).toBe('9876543212');
    expect(normalizePhone('98765-43212')).toBe('9876543212');
    expect(isSamePhone('+919876543212', '9876543212')).toBe(true);
    expect(isSamePhone('9876543210', '9876543212')).toBe(false);
  });

  it('finds group member by phone number even if ID differs', () => {
    const members: GroupMember[] = [
      { id: 'usr_alex', name: 'Alex Rivers', phone: '9876543210' },
      { id: 'usr_rahul', name: 'Rahul Verma', phone: '9876543212' },
      { id: 'usr_priya', name: 'Priya Sharma', phone: '9876543211' }
    ];

    const loggedInUser: UserProfile = {
      id: 'custom_id_123',
      name: 'Rahul V',
      phone: '+91 98765 43212',
      defaultCurrency: 'INR',
      createdAt: ''
    };

    const member = findMemberForUser(members, loggedInUser);
    expect(member).toBeDefined();
    expect(member?.id).toBe('usr_rahul');
    expect(member?.name).toBe('Rahul Verma');
  });

  it('filters groups so Rahul only sees Goa Trip and Flat 402, not Weekend Dinner', () => {
    const rahulUser: UserProfile = {
      id: 'usr_rahul',
      name: 'Rahul Verma',
      phone: '9876543212',
      defaultCurrency: 'INR',
      createdAt: ''
    };

    const rahulGroups = TEST_GROUPS.filter((g) => isUserInGroup(g.members, rahulUser));

    expect(rahulGroups.length).toBe(2);
    const groupNames = rahulGroups.map((g) => g.name);
    expect(groupNames).toContain('Goa Trip 🏖️');
    expect(groupNames).toContain('Flat 402 Expenses 🏠');
    expect(groupNames).not.toContain('Weekend Dinner 🍕');
  });

  it('filters groups so Priya only sees Goa Trip and Weekend Dinner, not Flat 402', () => {
    const priyaUser: UserProfile = {
      id: 'usr_priya',
      name: 'Priya Sharma',
      phone: '9876543211',
      defaultCurrency: 'INR',
      createdAt: ''
    };

    const priyaGroups = TEST_GROUPS.filter((g) => isUserInGroup(g.members, priyaUser));

    expect(priyaGroups.length).toBe(2);
    const groupNames = priyaGroups.map((g) => g.name);
    expect(groupNames).toContain('Goa Trip 🏖️');
    expect(groupNames).toContain('Weekend Dinner 🍕');
    expect(groupNames).not.toContain('Flat 402 Expenses 🏠');
  });
});
