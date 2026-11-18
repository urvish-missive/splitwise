import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setUser, setLoading } from '@/features/auth/authSlice';
import { setGroups } from '@/features/groups/groupsSlice';
import { setExpenses, setSettlements } from '@/features/expenses/expensesSlice';
import {
  saveUserProfileToFirestore,
  subscribeToAllGroups,
  subscribeToAllExpenses,
  subscribeToAllSettlements
} from '@/features/api/firestoreService';
import { UserProfile } from '@/types';

export function useFirebaseAuth() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    dispatch(setLoading(true));
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || '',
          avatarUrl: fbUser.photoURL || undefined,
          defaultCurrency: 'INR',
          createdAt: new Date().toISOString()
        };

        dispatch(setUser(profile));
        await saveUserProfileToFirestore(profile);
      }
      dispatch(setLoading(false));
    });

    return () => unsubscribeAuth();
  }, [dispatch]);

  // 2. Real-time Firestore sync for all groups, expenses, settlements
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubGroups = subscribeToAllGroups((remoteGroups) => {
      if (remoteGroups) {
        dispatch(setGroups(remoteGroups));
      }
    });

    const unsubExpenses = subscribeToAllExpenses((remoteExpenses) => {
      if (remoteExpenses) {
        dispatch(setExpenses(remoteExpenses));
      }
    });

    const unsubSettlements = subscribeToAllSettlements((remoteSettlements) => {
      if (remoteSettlements) {
        dispatch(setSettlements(remoteSettlements));
      }
    });

    return () => {
      if (unsubGroups) unsubGroups();
      if (unsubExpenses) unsubExpenses();
      if (unsubSettlements) unsubSettlements();
    };
  }, [dispatch]);
}
