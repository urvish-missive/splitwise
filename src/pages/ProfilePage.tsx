import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { updateCurrency, updateName, updatePhone, setUser, logout, setDemoMode } from '@/features/auth/authSlice';
import { setExpenses, setSettlements } from '@/features/expenses/expensesSlice';
import { setGroups } from '@/features/groups/groupsSlice';
import { setContacts } from '@/features/contacts/contactsSlice';
import { CURRENT_USER } from '@/lib/seedData';
import { wipeAllLocalData } from '@/lib/storageCleanup';
import { Card } from '@/features/ui/Card';
import { Button } from '@/features/ui/Button';
import { Input } from '@/features/ui/Input';
import { Select } from '@/features/ui/Select';
import { Avatar } from '@/features/ui/Avatar';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { logoutUser } from '@/features/auth/authService';
import { isFirebaseConfigured, auth } from '@/lib/firebase';
import { CurrencyCode } from '@/types';
import { toast } from 'sonner';
import {
  Smartphone,
  Download,
  Database,
  RotateCcw,
  Check,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
  Sparkles,
  Cloud
} from 'lucide-react';

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isDemoMode = useAppSelector((state) => state.auth.isDemoMode);

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [currency, setCurrency] = useState<CurrencyCode>(
    currentUser?.defaultCurrency || 'INR'
  );
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    if (currentUser?.name) setName(currentUser.name);
    if (currentUser?.phone) setPhone(currentUser.phone);
    if (currentUser?.defaultCurrency) setCurrency(currentUser.defaultCurrency);
  }, [currentUser]);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        toast.success('Splitwise installed to your device!');
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      toast.info(
        'To install: Tap your browser share menu or 3-dots icon, then select "Add to Home Screen".'
      );
    }
  };

  const handleSaveProfile = () => {
    if (!name.trim()) return;
    dispatch(updateName(name.trim()));
    if (phone.trim()) dispatch(updatePhone(phone.trim()));
    dispatch(updateCurrency(currency));
    toast.success('Profile and preferences updated!');
  };

  const handleSignOut = async () => {
    await logoutUser();
    dispatch(setUser(CURRENT_USER));
    dispatch(setDemoMode(true));
    toast.info('Signed out. Switched to guest mode.');
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        'Delete all groups, expenses, settlements, and dummy data to start completely fresh?'
      )
    ) {
      wipeAllLocalData();
      dispatch(setGroups([]));
      dispatch(setExpenses([]));
      dispatch(setSettlements([]));
      dispatch(setContacts([]));
      dispatch(setUser(CURRENT_USER));
      toast.success('All dummy data deleted! You now have a clean, fresh app.');
    }
  };

  const isRealUser = auth?.currentUser && !isDemoMode;

  return (
    <div className="min-h-screen pb-24 max-w-lg mx-auto">
      {/* Fixed Sticky Header */}
      <header className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/70 shadow-2xs flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">Account & Cloud</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Manage your Firebase login, currency, and PWA
          </p>
        </div>

        {isRealUser ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSignOut}
            className="text-xs h-8 px-2.5 gap-1 text-slate-600 border-slate-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => setIsAuthOpen(true)}
            className="text-xs h-8 px-2.5 gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </Button>
        )}
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* Firebase Account Banner */}
        <Card className="border-slate-200/80 p-4 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <Avatar
                name={currentUser?.name || 'User'}
                src={currentUser?.avatarUrl}
                size="lg"
                className="ring-2 ring-white/30"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">{currentUser?.name}</h3>
                  <span
                    className={`text-[9px] font-semibold px-2 py-0.2 rounded-full ${
                      isRealUser
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {isRealUser ? 'Cloud Connected' : 'Guest / Demo'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentUser?.phone ? `Phone: ${currentUser.phone}` : currentUser?.email}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAuthOpen(true)}
              className="text-xs h-8 px-2.5 bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              {isRealUser ? 'Switch Account' : 'Sign In'}
            </Button>
          </div>
        </Card>

        {/* PWA Mobile Installation Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 border-none shadow-md">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold">Install Splitwise PWA</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                {isAppInstalled
                  ? 'App is installed on your device.'
                  : 'Install on your phone or desktop for instant offline access and native app feel.'}
              </p>

              {!isAppInstalled && (
                <Button
                  size="sm"
                  onClick={handleInstallPWA}
                  className="mt-3 bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xs"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Install App
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Profile Settings */}
        <Card className="border-slate-200/80 p-4 space-y-3.5">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            User Preferences
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Display Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your 10-digit phone number"
            />
          </div>

          <div>
            <Select
              label="Default Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              options={[
                { value: 'INR', label: 'INR (₹) - Indian Rupee' },
                { value: 'USD', label: 'USD ($) - US Dollar' },
                { value: 'EUR', label: 'EUR (€) - Euro' },
                { value: 'GBP', label: 'GBP (£) - British Pound' },
                { value: 'AUD', label: 'AUD (A$) - Australian Dollar' },
                { value: 'CAD', label: 'CAD (C$) - Canadian Dollar' },
                { value: 'SGD', label: 'SGD (S$) - Singapore Dollar' },
                { value: 'AED', label: 'AED - UAE Dirham' }
              ]}
            />
          </div>

          <Button onClick={handleSaveProfile} className="w-full">
            <Check className="h-4 w-4 mr-1.5" />
            Save Changes
          </Button>
        </Card>

        {/* Backend & Firebase Status */}
        <Card className="border-slate-200/80 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-600" />
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Firebase Backend Status
              </h4>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isFirebaseConfigured
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-blue-50 text-blue-700'
              }`}
            >
              {isFirebaseConfigured ? 'Firebase Active' : 'Offline / Demo Mode'}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
            {isFirebaseConfigured
              ? 'Connected to Firebase Authentication and Cloud Firestore. Any new group, expense, or settlement is synchronized directly to your Firestore database.'
              : 'Add your Firebase credentials to .env to enable Cloud Firestore database sync and Google Authentication.'}
          </p>
        </Card>

        {/* Clear All Dummy Data */}
        <Card className="border-red-200/80 bg-red-50/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-red-900">Delete All Dummy Data</h4>
              <p className="text-xs text-red-700/80 mt-0.5">
                Wipe all sample groups, expenses, and contacts to start completely fresh
              </p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleClearAllData}
              className="text-xs font-semibold gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear All Data
            </Button>
          </div>
        </Card>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
