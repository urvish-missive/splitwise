import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { Group, Expense, Settlement, UserProfile } from '@/types';

/**
 * Save user profile to Firestore `/users/{uid}`
 */
export async function saveUserProfileToFirestore(user: UserProfile): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
  } catch (error) {
    console.error('Error saving user profile to Firestore:', error);
  }
}

/**
 * Create or update a group in Firestore `/groups/{groupId}`
 */
export async function saveGroupToFirestore(group: Group): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const groupRef = doc(db, 'groups', group.id);
    await setDoc(groupRef, group, { merge: true });
  } catch (error) {
    console.error('Error saving group to Firestore:', error);
    throw error;
  }
}

/**
 * Delete a group from Firestore
 */
export async function deleteGroupFromFirestore(groupId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const groupRef = doc(db, 'groups', groupId);
    await deleteDoc(groupRef);
  } catch (error) {
    console.error('Error deleting group from Firestore:', error);
    throw error;
  }
}

/**
 * Add or update an expense in Firestore `/expenses/{expenseId}`
 */
export async function saveExpenseToFirestore(expense: Expense): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const expenseRef = doc(db, 'expenses', expense.id);
    await setDoc(expenseRef, expense, { merge: true });
  } catch (error) {
    console.error('Error saving expense to Firestore:', error);
    throw error;
  }
}

/**
 * Delete an expense from Firestore
 */
export async function deleteExpenseFromFirestore(expenseId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error('Error deleting expense from Firestore:', error);
    throw error;
  }
}

/**
 * Add a settlement in Firestore `/settlements/{settlementId}`
 */
export async function saveSettlementToFirestore(settlement: Settlement): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const settlementRef = doc(db, 'settlements', settlement.id);
    await setDoc(settlementRef, settlement, { merge: true });
  } catch (error) {
    console.error('Error saving settlement to Firestore:', error);
    throw error;
  }
}

/**
 * Delete a settlement from Firestore
 */
export async function deleteSettlementFromFirestore(settlementId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const settlementRef = doc(db, 'settlements', settlementId);
    await deleteDoc(settlementRef);
  } catch (error) {
    console.error('Error deleting settlement from Firestore:', error);
    throw error;
  }
}

/**
 * Real-time subscription to all groups in Firestore
 */
export function subscribeToAllGroups(
  onUpdate: (groups: Group[]) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const q = collection(db, 'groups');
    return onSnapshot(
      q,
      (snapshot) => {
        const groups: Group[] = [];
        snapshot.forEach((doc) => {
          groups.push(doc.data() as Group);
        });
        groups.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
        );
        onUpdate(groups);
      },
      (error) => {
        console.warn('Firestore all groups subscription error:', error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to all groups:', err);
    return null;
  }
}

/**
 * Real-time subscription to all expenses in Firestore
 */
export function subscribeToAllExpenses(
  onUpdate: (expenses: Expense[]) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const q = collection(db, 'expenses');
    return onSnapshot(
      q,
      (snapshot) => {
        const expenses: Expense[] = [];
        snapshot.forEach((doc) => {
          expenses.push(doc.data() as Expense);
        });
        expenses.sort(
          (a, b) =>
            new Date(b.date || b.createdAt).getTime() -
            new Date(a.date || a.createdAt).getTime()
        );
        onUpdate(expenses);
      },
      (error) => {
        console.warn('Firestore all expenses subscription error:', error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to all expenses:', err);
    return null;
  }
}

/**
 * Real-time subscription to all settlements in Firestore
 */
export function subscribeToAllSettlements(
  onUpdate: (settlements: Settlement[]) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const q = collection(db, 'settlements');
    return onSnapshot(
      q,
      (snapshot) => {
        const settlements: Settlement[] = [];
        snapshot.forEach((doc) => {
          settlements.push(doc.data() as Settlement);
        });
        settlements.sort(
          (a, b) =>
            new Date(b.date || b.createdAt).getTime() -
            new Date(a.date || a.createdAt).getTime()
        );
        onUpdate(settlements);
      },
      (error) => {
        console.warn('Firestore all settlements subscription error:', error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to all settlements:', err);
    return null;
  }
}

/**
 * Real-time subscription to groups where user is a member
 */
export function subscribeToUserGroups(
  userId: string,
  onUpdate: (groups: Group[]) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured || !db || !userId) return null;

  try {
    const q = query(
      collection(db, 'groups'),
      where('memberIds', 'array-contains', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const groups: Group[] = [];
        snapshot.forEach((doc) => {
          groups.push(doc.data() as Group);
        });
        // Sort by updatedAt descending
        groups.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        onUpdate(groups);
      },
      (error) => {
        console.warn('Firestore groups subscription error:', error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to user groups:', err);
    return null;
  }
}

/**
 * Real-time subscription to all expenses for a group
 */
export function subscribeToGroupExpenses(
  groupId: string,
  onUpdate: (expenses: Expense[]) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured || !db || !groupId) return null;

  try {
    const q = query(
      collection(db, 'expenses'),
      where('groupId', '==', groupId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const expenses: Expense[] = [];
        snapshot.forEach((doc) => {
          expenses.push(doc.data() as Expense);
        });
        expenses.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        onUpdate(expenses);
      },
      (error) => {
        console.warn('Firestore expenses subscription error:', error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to group expenses:', err);
    return null;
  }
}

/**
 * Real-time subscription to all settlements for a group
 */
export function subscribeToGroupSettlements(
  groupId: string,
  onUpdate: (settlements: Settlement[]) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured || !db || !groupId) return null;

  try {
    const q = query(
      collection(db, 'settlements'),
      where('groupId', '==', groupId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const settlements: Settlement[] = [];
        snapshot.forEach((doc) => {
          settlements.push(doc.data() as Settlement);
        });
        settlements.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        onUpdate(settlements);
      },
      (error) => {
        console.warn('Firestore settlements subscription error:', error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to group settlements:', err);
    return null;
  }
}
