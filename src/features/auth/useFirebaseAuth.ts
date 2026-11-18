import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setUser, setLoading } from '@/features/auth/authSlice';
import { setGroups } from '@/features/groups/groupsSlice';
import {
  saveUserProfileToFirestore,
  subscribeToUserGroups
} from '@/features/api/firestoreService';
import { UserProfile } from '@/types';

export function useFirebaseAuth() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isDemoMode = useAppSelector((state) => state.auth.isDemoMode);

  // Listen to Firebase Auth state
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

  // Real-time Firestore sync for groups when logged into Firebase
  useEffect(() => {
    if (!isFirebaseConfigured || !currentUser || isDemoMode) return;

    const unsubscribeGroups = subscribeToUserGroups(currentUser.id, (groups) => {
      if (groups && groups.length > 0) {
        dispatch(setGroups(groups));
      }
    });

    return () => {
      if (unsubscribeGroups) unsubscribeGroups();
    };
  }, [currentUser, isDemoMode, dispatch]);
}
