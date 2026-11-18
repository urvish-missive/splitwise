import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { updateCurrency, updateName, setUser } from '@/features/auth/authSlice';
import { resetToDemoData } from '@/features/expenses/expensesSlice';
import { setGroups } from '@/features/groups/groupsSlice';
import { SEED_GROUPS, CURRENT_USER } from '@/lib/seedData';
import { Card } from '@/features/ui/Card';
import { Button } from '@/features/ui/Button';
import { Input } from '@/features/ui/Input';
import { Select } from '@/features/ui/Select';
import { Avatar } from '@/features/ui/Avatar';
import { isFirebaseConfigured } from '@/lib/firebase';
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
  Sparkles
} from 'lucide-react';

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState(currentUser?.name || '');
  const [currency, setCurrency] = useState<CurrencyCode>(
    currentUser?.defaultCurrency || 'INR'
  );
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

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
    dispatch(updateCurrency(currency));
    toast.success('Profile and preferences updated!');
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Reset all data back to original sample groups (Goa Trip, Flat Expenses, Weekend Dinner)?'
      )
    ) {
      dispatch(setUser(CURRENT_USER));
      dispatch(setGroups(SEED_GROUPS));
      dispatch(resetToDemoData());
      toast.success('Reset to demo sample data completed!');
    }
  };

  return (
    <div className="min-h-screen pb-24 max-w-lg mx-auto">
      {/* Fixed Sticky Header */}
      <header className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/70 shadow-2xs">
        <h1 className="text-base font-bold text-slate-900 leading-tight">Account & Settings</h1>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Manage your profile, currency, and PWA installation
        </p>
      </header>

      <div className="px-4 pt-4 space-y-4">
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
                  ? 'App is already installed on your home screen.'
                  : 'Install on your phone or desktop for instant offline access and native app experience.'}
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
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <Avatar name={name || 'User'} size="lg" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">{currentUser?.name}</h3>
              <p className="text-xs text-slate-500">{currentUser?.email}</p>
            </div>
          </div>

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
                Backend Status
              </h4>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isFirebaseConfigured
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-blue-50 text-blue-700'
              }`}
            >
              {isFirebaseConfigured ? 'Firebase Connected' : 'Offline / Demo Mode'}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
            {isFirebaseConfigured
              ? 'Connected to Firebase Authentication and Cloud Firestore. Live sync enabled.'
              : 'Running in high-speed local mode with localStorage persistence. To connect to your Firebase project, provide your credentials in .env.'}
          </p>
        </Card>

        {/* Sample Data Reset */}
        <Card className="border-slate-200/80 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Reset Demo Data</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Restore default Goa Trip, Flat, and Dinner expenses
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetData}
              className="text-xs border-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
