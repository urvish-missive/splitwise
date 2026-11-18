import React, { useState } from 'react';
import { Dialog } from '@/features/ui/Dialog';
import { Button } from '@/features/ui/Button';
import { Input } from '@/features/ui/Input';
import { Tabs } from '@/features/ui/Tabs';
import { useAppDispatch } from '@/app/hooks';
import { setUser, setDemoMode } from '@/features/auth/authSlice';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail
} from '@/features/auth/authService';
import { saveUserProfileToFirestore } from '@/features/api/firestoreService';
import { CURRENT_USER } from '@/lib/seedData';
import { isFirebaseConfigured } from '@/lib/firebase';
import { toast } from 'sonner';
import { LogIn, UserPlus, Lock, Mail, User, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      toast.error(error.message || 'Google sign in failed.');
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
      if (tab === 'signin') {
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

  const handleGuestDemo = () => {
    dispatch(setUser(CURRENT_USER));
    dispatch(setDemoMode(true));
    toast.info('Logged in as Alex Rivers (Guest / Demo Mode).');
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={tab === 'signin' ? 'Sign In to Splitwise' : 'Create an Account'}
      description="Connect to your cloud account to sync expenses across all devices."
    >
      <div className="space-y-4 pt-1">
        {/* Google Sign In Button */}
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

        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs text-slate-400 font-medium shrink-0 uppercase tracking-wider">
            or with email
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* Sign In vs Sign Up Tabs */}
        <Tabs
          tabs={[
            { id: 'signin', label: 'Sign In' },
            { id: 'signup', label: 'Sign Up' }
          ]}
          activeTab={tab}
          onChange={(t) => setTab(t as any)}
        />

        <form onSubmit={handleEmailAuth} className="space-y-3 pt-1">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Name
              </label>
              <Input
                placeholder="e.g. Alex Rivers"
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
            {tab === 'signin' ? (
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

        {/* Guest Demo option */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={handleGuestDemo}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Want to test first? <span className="text-blue-600 underline">Continue as Guest (Demo Mode)</span>
          </button>
        </div>
      </div>
    </Dialog>
  );
}
