import {
  Expense,
  Settlement,
  GroupMember,
  MemberBalance,
  GroupBalanceCalculation,
  DebtSimplification
} from '@/types';

/**
 * Calculates net balances for all members and simplifies debts to minimize transactions.
 */
export function calculateGroupBalances(
  members: GroupMember[],
  expenses: Expense[],
  settlements: Settlement[]
): GroupBalanceCalculation {
  const memberBalances: Record<string, MemberBalance> = {};

  // Initialize balances for all group members
  members.forEach((m) => {
    memberBalances[m.id] = {
      memberId: m.id,
      netBalance: 0,
      owesTotal: 0,
      owedTotal: 0
    };
  });

  let totalGroupExpenses = 0;
  let totalGroupSettlements = 0;

  // Process all expenses
  expenses.forEach((expense) => {
    totalGroupExpenses += expense.amount;
    const payerId = expense.paidById;

    // Ensure payer exists in balances
    if (!memberBalances[payerId]) {
      memberBalances[payerId] = {
        memberId: payerId,
        netBalance: 0,
        owesTotal: 0,
        owedTotal: 0
      };
    }

    // Payer paid the total amount (+ credit)
    memberBalances[payerId].netBalance += expense.amount;

    // Each participant in split owes their share (- debit)
    expense.splits.forEach((split) => {
      if (!memberBalances[split.memberId]) {
        memberBalances[split.memberId] = {
          memberId: split.memberId,
          netBalance: 0,
          owesTotal: 0,
          owedTotal: 0
        };
      }
      memberBalances[split.memberId].netBalance -= split.amount;
    });
  });

  // Process all settlements
  settlements.forEach((settlement) => {
    totalGroupSettlements += settlement.amount;
    const { payerId, receiverId, amount } = settlement;

    if (!memberBalances[payerId]) {
      memberBalances[payerId] = {
        memberId: payerId,
        netBalance: 0,
        owesTotal: 0,
        owedTotal: 0
      };
    }
    if (!memberBalances[receiverId]) {
      memberBalances[receiverId] = {
        memberId: receiverId,
        netBalance: 0,
        owesTotal: 0,
        owedTotal: 0
      };
    }

    // Payer has settled their debt (+ reduces their negative balance / adds to net)
    memberBalances[payerId].netBalance += amount;
    // Receiver has received money (- reduces what they were owed)
    memberBalances[receiverId].netBalance -= amount;
  });

  // Round balances to 2 decimal places and update owesTotal / owedTotal
  Object.values(memberBalances).forEach((mb) => {
    mb.netBalance = Math.round(mb.netBalance * 100) / 100;
    if (Math.abs(mb.netBalance) < 0.01) {
      mb.netBalance = 0;
    }
    if (mb.netBalance > 0) {
      mb.owedTotal = mb.netBalance;
      mb.owesTotal = 0;
    } else {
      mb.owesTotal = Math.abs(mb.netBalance);
      mb.owedTotal = 0;
    }
  });

  // Simplify debts (Min Cash Flow Algorithm)
  const simplifiedDebts = simplifyDebts(memberBalances);

  return {
    memberBalances,
    simplifiedDebts,
    totalGroupExpenses,
    totalGroupSettlements
  };
}

/**
 * Greedy Min-Cash-Flow Algorithm to find the minimum number of transactions
 * required to settle all debts in the group.
 */
function simplifyDebts(
  memberBalances: Record<string, MemberBalance>
): DebtSimplification[] {
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  Object.values(memberBalances).forEach((mb) => {
    if (mb.netBalance < -0.01) {
      debtors.push({ id: mb.memberId, amount: Math.abs(mb.netBalance) });
    } else if (mb.netBalance > 0.01) {
      creditors.push({ id: mb.memberId, amount: mb.netBalance });
    }
  });

  // Sort descending by amount to minimize total transaction count
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const debts: DebtSimplification[] = [];

  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settledAmount = Math.min(debtor.amount, creditor.amount);
    const roundedAmount = Math.round(settledAmount * 100) / 100;

    if (roundedAmount > 0.01) {
      debts.push({
        fromId: debtor.id,
        toId: creditor.id,
        amount: roundedAmount
      });
    }

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount < 0.01) {
      i++;
    }
    if (creditor.amount < 0.01) {
      j++;
    }
  }

  return debts;
}

/**
 * Computes individual pairwise balance between current user and target user
 * across all expenses & settlements.
 */
export function calculatePairwiseBalance(
  currentUserId: string,
  targetUserId: string,
  expenses: Expense[],
  settlements: Settlement[]
): number {
  let net = 0;

  // Expenses
  expenses.forEach((expense) => {
    const isCurrentUserPayer = expense.paidById === currentUserId;
    const isTargetUserPayer = expense.paidById === targetUserId;

    expense.splits.forEach((split) => {
      // If current user paid and target user owes a share:
      if (isCurrentUserPayer && split.memberId === targetUserId) {
        net += split.amount; // target owes current user
      }
      // If target user paid and current user owes a share:
      if (isTargetUserPayer && split.memberId === currentUserId) {
        net -= split.amount; // current user owes target user
      }
    });
  });

  // Settlements
  settlements.forEach((settlement) => {
    // Current user paid target user directly
    if (settlement.payerId === currentUserId && settlement.receiverId === targetUserId) {
      net += settlement.amount; // reduces current user's debt or gives credit
    }
    // Target user paid current user directly
    if (settlement.payerId === targetUserId && settlement.receiverId === currentUserId) {
      net -= settlement.amount;
    }
  });

  return Math.round(net * 100) / 100;
}
