import { describe, it, expect } from 'vitest';
import {
  calculateGroupBalances,
  calculatePairwiseBalance
} from './balanceCalculator';
import { GroupMember, Expense, Settlement } from '@/types';

describe('balanceCalculator', () => {
  const members: GroupMember[] = [
    { id: 'u1', name: 'Alice' },
    { id: 'u2', name: 'Bob' },
    { id: 'u3', name: 'Charlie' }
  ];

  it('correctly calculates net balance for equal split', () => {
    // Alice pays 300, split equally between Alice, Bob, Charlie (100 each)
    const expenses: Expense[] = [
      {
        id: 'e1',
        groupId: 'g1',
        title: 'Dinner',
        amount: 300,
        category: 'food',
        date: new Date().toISOString(),
        paidById: 'u1',
        splitType: 'equal',
        splits: [
          { memberId: 'u1', amount: 100 },
          { memberId: 'u2', amount: 100 },
          { memberId: 'u3', amount: 100 }
        ],
        createdAt: new Date().toISOString(),
        createdBy: 'u1'
      }
    ];

    const result = calculateGroupBalances(members, expenses, []);

    // Alice paid 300, owes 100 => net +200
    expect(result.memberBalances['u1'].netBalance).toBe(200);
    // Bob owes 100 => net -100
    expect(result.memberBalances['u2'].netBalance).toBe(-100);
    // Charlie owes 100 => net -100
    expect(result.memberBalances['u3'].netBalance).toBe(-100);

    // Simplified debts: Bob owes Alice 100, Charlie owes Alice 100
    expect(result.simplifiedDebts).toHaveLength(2);
    expect(result.simplifiedDebts).toEqual(
      expect.arrayContaining([
        { fromId: 'u2', toId: 'u1', amount: 100 },
        { fromId: 'u3', toId: 'u1', amount: 100 }
      ])
    );
  });

  it('correctly accounts for settlements in group balances', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        groupId: 'g1',
        title: 'Dinner',
        amount: 300,
        category: 'food',
        date: new Date().toISOString(),
        paidById: 'u1',
        splitType: 'equal',
        splits: [
          { memberId: 'u1', amount: 100 },
          { memberId: 'u2', amount: 100 },
          { memberId: 'u3', amount: 100 }
        ],
        createdAt: new Date().toISOString(),
        createdBy: 'u1'
      }
    ];

    // Bob settles up 100 with Alice
    const settlements: Settlement[] = [
      {
        id: 's1',
        groupId: 'g1',
        payerId: 'u2',
        receiverId: 'u1',
        amount: 100,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: 'u2'
      }
    ];

    const result = calculateGroupBalances(members, expenses, settlements);

    // Bob is now completely settled
    expect(result.memberBalances['u2'].netBalance).toBe(0);
    // Alice net balance is now +100
    expect(result.memberBalances['u1'].netBalance).toBe(100);
    // Only Charlie owes Alice 100
    expect(result.simplifiedDebts).toHaveLength(1);
    expect(result.simplifiedDebts[0]).toEqual({
      fromId: 'u3',
      toId: 'u1',
      amount: 100
    });
  });

  it('calculates pairwise balance between two users correctly', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        groupId: 'g1',
        title: 'Tickets',
        amount: 100,
        category: 'entertainment',
        date: new Date().toISOString(),
        paidById: 'u1',
        splitType: 'equal',
        splits: [
          { memberId: 'u1', amount: 50 },
          { memberId: 'u2', amount: 50 }
        ],
        createdAt: new Date().toISOString(),
        createdBy: 'u1'
      }
    ];

    // u1 paid 100, u2 owes 50 => Pairwise for u1 vs u2 should be +50
    expect(calculatePairwiseBalance('u1', 'u2', expenses, [])).toBe(50);
    // Pairwise for u2 vs u1 should be -50
    expect(calculatePairwiseBalance('u2', 'u1', expenses, [])).toBe(-50);
  });
});
