import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addMemberToGroup } from '@/features/groups/groupsSlice';
import { setUser, setDemoMode } from '@/features/auth/authSlice';
import { loginOrRegisterWithPhoneAndPin } from '@/features/auth/phoneAuthService';
import {
  saveGroupToFirestore,
  fetchGroupByCode,
  fetchGroupById
} from '@/features/api/firestoreService';
import { Card } from '@/features/ui/Card';
import { Button } from '@/features/ui/Button';
import { Input } from '@/features/ui/Input';
import { Avatar } from '@/features/ui/Avatar';
import { toast } from 'sonner';
import {
  LogIn,
  Users,
  Sparkles,
  ArrowLeft,
  Phone,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Group, GroupMember } from '@/types';
import { normalizePhone } from '@/lib/utils';

export function JoinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const groups = useAppSelector((state) => state.groups.groups);
  const currentUser = useAppSelector((state) => state.auth.user);

  const initialCode = searchParams.get('code') || '';
  const initialGid = searchParams.get('gid') || '';

  const [code, setCode] = useState(initialCode);
  const [remoteGroup, setRemoteGroup] = useState<Group | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Phone + PIN login form fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [phoneName, setPhoneName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find matching group from Redux or remote
  const reduxGroup = groups.find(
    (g) =>
      (code && g.inviteCode?.toUpperCase() === code.trim().toUpperCase()) ||
      (initialGid && g.id === initialGid)
  );

  const matchingGroup = reduxGroup || remoteGroup;

  // If group not in Redux yet, try fetching from Firestore
  useEffect(() => {
    if (reduxGroup) return;

    let isMounted = true;
    async function loadGroup() {
      setIsSearching(true);
      try {
        if (code.trim()) {
          const found = await fetchGroupByCode(code.trim());
          if (isMounted && found) {
            setRemoteGroup(found);
            setIsSearching(false);
            return;
          }
        }
        if (initialGid) {
          const found = await fetchGroupById(initialGid);
          if (isMounted && found) {
            setRemoteGroup(found);
          }
        }
      } catch (err) {
        console.warn('Error fetching group:', err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    }

    if (code.trim() || initialGid) {
      loadGroup();
    }
    return () => {
      isMounted = false;
    };
  }, [code, initialGid, reduxGroup]);

  // Join group helper
  const executeJoin = async (groupToJoin: Group, user: typeof currentUser) => {
    if (!user) return;

    const userDigits = user.phone ? normalizePhone(user.phone) : '';
    const alreadyJoined =
      groupToJoin.memberIds?.includes(user.id) ||
      (userDigits && groupToJoin.memberPhones?.some((p) => normalizePhone(p) === userDigits));

    if (!alreadyJoined) {
      const newMember: GroupMember = {
        id: user.id,
        name: `${user.name} (You)`,
        phone: user.phone,
        email: user.email,
        isRegistered: true
      };

      const updatedMembers = [...groupToJoin.members, newMember];
      const updatedMemberIds = Array.from(new Set([...(groupToJoin.memberIds || []), user.id]));
      const updatedMemberPhones = user.phone
        ? Array.from(new Set([...(groupToJoin.memberPhones || []), user.phone]))
        : groupToJoin.memberPhones;

      const updatedGroup: Group = {
        ...groupToJoin,
        members: updatedMembers,
        memberIds: updatedMemberIds,
        memberPhones: updatedMemberPhones,
        updatedAt: new Date().toISOString()
      };

      dispatch(
        addMemberToGroup({
          groupId: groupToJoin.id,
          member: newMember
        })
      );

      try {
        await saveGroupToFirestore(updatedGroup);
      } catch (err) {
        console.warn('Could not sync group join to Firestore immediately:', err);
      }
      toast.success(`Joined "${groupToJoin.name}"!`);
    } else {
      toast.success(`Opening "${groupToJoin.name}"`);
    }

    navigate(`/group/${groupToJoin.id}`);
  };

  // Handler for already-logged-in user
  const handleJoinExisting = async () => {
    if (!matchingGroup) {
      toast.error('Please enter a valid invite code');
      return;
    }
    await executeJoin(matchingGroup, currentUser);
  };

  // Handler for unauthenticated user: Log in with Phone + PIN and Join
  const handlePhoneLoginAndJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchingGroup) {
      toast.error('No matching group found. Check your invite code.');
      return;
    }

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    const cleanPin = pin.trim();
    if (!cleanPin || cleanPin.length !== 4) {
      toast.error('Please enter your 4-digit PIN (e.g. 1234)');
      return;
    }

    setIsSubmitting(true);
    try {
      const userProfile = await loginOrRegisterWithPhoneAndPin(
        cleanPhone,
        cleanPin,
        phoneName
      );

      dispatch(setUser(userProfile));
      dispatch(setDemoMode(false));

      await executeJoin(matchingGroup, userProfile);
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in. Please verify your PIN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoggedIn = Boolean(currentUser?.id && (currentUser?.phone || currentUser?.email));

  return (
    <div className="min-h-screen max-w-lg mx-auto pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/70 shadow-2xs flex items-center">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </header>

      <div className="px-4 pt-6 space-y-4">
        {/* Group Preview Card */}
        <Card className="p-6 border-slate-200/80 shadow-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-7 w-7" />
          </div>

          <h1 className="text-xl font-bold text-slate-900">Join Expense Group</h1>
          <p className="text-xs text-slate-500 mt-1">
            Split expenses and track balances effortlessly with friends.
          </p>

          <div className="mt-5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 text-left mb-1">
              Invite Code
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. GOA-4821"
              className="text-center font-mono uppercase text-lg font-bold tracking-widest"
            />
          </div>

          {isSearching && (
            <p className="text-xs text-slate-400 mt-2 animate-pulse">
              Looking up group details...
            </p>
          )}

          {matchingGroup && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Group Found
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {matchingGroup.name}
                  </h3>
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {matchingGroup.members?.length || 0} members
                  </p>
                </div>
                <div className="flex -space-x-2">
                  {matchingGroup.members?.slice(0, 3).map((m) => (
                    <Avatar key={m.id} name={m.name} size="sm" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Authenticated Flow */}
        {isLoggedIn && matchingGroup && (
          <Card className="p-5 border-slate-200/80 shadow-md">
            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Avatar name={currentUser?.name || 'User'} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500">Joining as</p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {currentUser?.name}
                </p>
                {currentUser?.phone && (
                  <p className="text-xs text-slate-500 font-mono">
                    {currentUser.phone}
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleJoinExisting}
              className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Join {matchingGroup.name}
            </Button>
          </Card>
        )}

        {/* Unauthenticated Quick Login Flow: Phone Number + 4-digit PIN */}
        {!isLoggedIn && (
          <Card className="p-5 border-slate-200/80 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Quick Sign In to Join
                </h2>
                <p className="text-[11px] text-slate-500">
                  Enter your mobile number and 4-digit PIN to join instantly.
                </p>
              </div>
            </div>

            <form onSubmit={handlePhoneLoginAndJoin} className="space-y-3.5 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  leftIcon={<Phone className="h-4 w-4" />}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4-Digit PIN <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  maxLength={4}
                  placeholder="•••• (e.g. 1234)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Set any 4-digit PIN for future quick logins.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Name <span className="text-slate-400 font-normal">(optional if already registered)</span>
                </label>
                <Input
                  placeholder="e.g. Priya Sharma"
                  value={phoneName}
                  onChange={(e) => setPhoneName(e.target.value)}
                  leftIcon={<User className="h-4 w-4" />}
                />
              </div>

              <Button
                type="submit"
                disabled={!matchingGroup}
                isLoading={isSubmitting}
                className="w-full h-12 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
              >
                <LogIn className="h-4 w-4 mr-2" />
                {matchingGroup
                  ? `Sign In & Join "${matchingGroup.name}"`
                  : 'Enter Valid Invite Code'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
