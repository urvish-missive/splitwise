import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { UserProfile } from '@/types';

export async function loginWithGoogle(): Promise<UserProfile | null> {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error('Firebase is not configured yet. Please add your credentials to .env');
  }

  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  return {
    id: fbUser.uid,
    name: fbUser.displayName || 'Google User',
    email: fbUser.email || '',
    avatarUrl: fbUser.photoURL || undefined,
    defaultCurrency: 'INR',
    createdAt: new Date().toISOString()
  };
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured yet. Please add your credentials to .env');
  }

  const result = await signInWithEmailAndPassword(auth, email, pass);
  const fbUser = result.user;

  return {
    id: fbUser.uid,
    name: fbUser.displayName || email.split('@')[0],
    email: fbUser.email || email,
    avatarUrl: fbUser.photoURL || undefined,
    defaultCurrency: 'INR',
    createdAt: new Date().toISOString()
  };
}

export async function registerWithEmail(
  name: string,
  email: string,
  pass: string
): Promise<UserProfile | null> {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured yet. Please add your credentials to .env');
  }

  const result = await createUserWithEmailAndPassword(auth, email, pass);
  const fbUser = result.user;

  return {
    id: fbUser.uid,
    name: name || fbUser.displayName || email.split('@')[0],
    email: fbUser.email || email,
    avatarUrl: fbUser.photoURL || undefined,
    defaultCurrency: 'INR',
    createdAt: new Date().toISOString()
  };
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}
