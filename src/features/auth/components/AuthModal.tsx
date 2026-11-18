import React, { useState } from 'react';
import { Dialog } from '@/features/ui/Dialog';
import { Button } from '@/features/ui/Button';
import { Input } from '@/features/ui/Input';
import { Tabs } from '@/features/ui/Tabs';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setUser, setDemoMode } from '@/features/auth/authSlice';
import { addContact } from '@/features/contacts/contactsSlice';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail
} from '@/features/auth/authService';
import { saveUserProfileToFirestore } from '@/features/api/firestoreService';
import { CURRENT_USER } from '@/lib/seedData';
import { isSamePhone, normalizePhone } from '@/lib/utils';
import { UserProfile } from '@/types';
import { toast } from 'sonner';
import {
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User,
  Phone
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const dispatch = useAppDispatch();
  const groups = useAppSelector((state) => state.groups.groups);
  const contacts = useAppSelector((state) => state.contacts.contacts);

  const [authMethod, setAuthMethod] = useState<'phone' | 'email' | 'google'>('phone');
  const [emailTab, setEmailTab] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);

  // Phone login form state
  const [phoneName, setPhoneName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Email form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle Phone-based login
  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // 1. Check if this phone number matches an existing member in any group
    let matchedMemberId: string | null = null;
    let matchedName: string | null = null;

    for (const g of groups) {
      const found = g.members.find((m) => isSamePhone(m.phone, cleanPhone));
      if (found) {
        matchedMemberId = found.id;
        matchedName = found.name.replace(' (You)', '');
        break;
      }
    }

    // 2. Or check contacts
    if (!matchedName) {
      const foundContact = contacts.find((c) => isSamePhone(c.phone, cleanPhone));
      if (foundContact) {
        matchedName = foundContact.name;
        matchedMemberId = foundContact.id;
      }
    }

    const finalName = phoneName.trim() || matchedName || `User ${cleanPhone.slice(-4)}`;
    const finalId = matchedMemberId || `usr_${normalizePhone(cleanPhone)}`;

    const userProfile: UserProfile = {
      id: finalId,
      name: finalName,
      phone: cleanPhone,
      email: `${normalizePhone(cleanPhone)}@splitwise.local`,
      defaultCurrency: 'INR',
      createdAt: new Date().toISOString()
    };

    dispatch(setUser(userProfile));
    dispatch(setDemoMode(false));
    saveUserProfileToFirestore(userProfile).catch(() => {});

    toast.success(`Logged in as ${finalName}!`);
    onClose();
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        dispatch(setUser(user));
        dispatch(setDemoMode(false));
        await saveUserProfileToFirestore(user);
        toast.success(`Welcome back, ${user.name}!`);
        onClose();
      }
    } catch (error: any) {
      if (
        error?.code === 'auth/unauthorized-domain' ||
        error?.message?.includes('unauthorized-domain')
      ) {
        const domain = window.location.hostname;
        toast.error(
          `Domain "${domain}" is not authorized! In Firebase Console > Authentication > Settings > Authorized domains, add "${domain}".`,
          { duration: 10000 }
        );
      } else {
        toast.error(error.message || 'Google sign in failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      if (emailTab === 'signin') {
        const user = await loginWithEmail(email, password);
        if (user) {
          dispatch(setUser(user));
          dispatch(setDemoMode(false));
          await saveUserProfileToFirestore(user);
          toast.success(`Welcome, ${user.name}!`);
          onClose();
        }
      } else {
        if (!name.trim()) {
          toast.error('Please enter your name.');
          setIsLoading(false);
          return;
        }
        const user = await registerWithEmail(name.trim(), email, password);
        if (user) {
          dispatch(setUser(user));
          dispatch(setDemoMode(false));
          await saveUserProfileToFirestore(user);
          toast.success(`Account created! Welcome, ${user.name}!`);
          onClose();
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Sign In to Splitwise"
      description="Log in with your phone number or email to sync your expenses."
    >
      <div className="space-y-4 pt-1">
        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAuthMethod('phone')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              authMethod === 'phone'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="h-3.5 w-3.5" />
            Phone No.
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              authMethod === 'email'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('google')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              authMethod === 'google'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Google
          </button>
        </div>

        {/* 1. Phone Login */}
        {authMethod === 'phone' && (
          <form onSubmit={handlePhoneLogin} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                leftIcon={<Phone className="h-4 w-4" />}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Name <span className="text-slate-400 font-normal">(optional if already registered)</span>
              </label>
              <Input
                placeholder="e.g. John Doe"
                value={phoneName}
                onChange={(e) => setPhoneName(e.target.value)}
                leftIcon={<User className="h-4 w-4" />}
              />
            </div>

            <Button type="submit" className="w-full h-11 text-sm font-semibold mt-2">
              <LogIn className="h-4 w-4 mr-2" />
              Log In with Phone Number
            </Button>
          </form>
        )}

        {/* 2. Email Auth */}
        {authMethod === 'email' && (
          <div className="space-y-4">
            <Tabs
              tabs={[
                { id: 'signin', label: 'Sign In' },
                { id: 'signup', label: 'Sign Up' }
              ]}
              activeTab={emailTab}
              onChange={(t) => setEmailTab(t as any)}
            />

            <form onSubmit={handleEmailAuth} className="space-y-3 pt-1">
              {emailTab === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name
                  </label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={<User className="h-4 w-4" />}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                />
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full h-11 text-sm mt-2">
                {emailTab === 'signin' ? (
                  <>
                    <LogIn className="h-4 w-4 mr-1.5" /> Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1.5" /> Create Account
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* 3. Google Auth */}
        {authMethod === 'google' && (
          <div className="space-y-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              isLoading={isLoading}
              className="w-full h-12 text-sm font-semibold border-slate-300 hover:bg-slate-50 gap-2.5 shadow-2xs"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
