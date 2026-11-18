import React, { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { GroupCard } from '@/features/groups/components/GroupCard';
import { CreateGroupModal } from '@/features/groups/components/CreateGroupModal';
import { JoinGroupModal } from '@/features/groups/components/JoinGroupModal';
import { AddExpenseModal } from '@/features/expenses/components/AddExpenseModal';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { Button } from '@/features/ui/Button';
import { Input } from '@/features/ui/Input';
import { Avatar } from '@/features/ui/Avatar';
import { Card } from '@/features/ui/Card';
import { formatCurrency, findMemberForUser, isUserInGroup } from '@/lib/utils';
import { calculateGroupBalances } from '@/features/balances/balanceCalculator';
import {
  Plus,
  QrCode,
  Search,
  Users,
  TrendingUp,
  TrendingDown,
  Phone,
  Sparkles
} from 'lucide-react';

export function DashboardPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const groups = useAppSelector((state) => state.groups.groups);
  const allExpenses = useAppSelector((state) => state.expenses.expenses);
  const allSettlements = useAppSelector((state) => state.expenses.settlements);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Groups belonging to the current user (by user ID or Phone number)
  const userGroups = groups.filter((g) => isUserInGroup(g.members, currentUser));

  // Calculate overall net balance across all user's groups
  let totalOwedToUser = 0; // Money others owe current user (+)
  let totalUserOwes = 0; // Money current user owes others (-)

  userGroups.forEach((group) => {
    const member = findMemberForUser(group.members, currentUser);
    if (!member) return;

    const groupExpenses = allExpenses.filter((e) => e.groupId === group.id);
    const groupSettlements = allSettlements.filter((s) => s.groupId === group.id);
    const { memberBalances } = calculateGroupBalances(
      group.members,
      groupExpenses,
      groupSettlements
    );

    const userBalance = memberBalances[member.id]?.netBalance || 0;
    if (userBalance > 0) {
      totalOwedToUser += userBalance;
    } else if (userBalance < 0) {
      totalUserOwes += Math.abs(userBalance);
    }
  });

  const netBalance = totalOwedToUser - totalUserOwes;
  const currency = currentUser?.defaultCurrency || 'INR';

  // Filter user's groups by search and category
  const filteredGroups = userGroups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.members.some((m) => m.name.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' || g.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Groups' },
    { id: 'trip', label: 'Trips' },
    { id: 'home', label: 'Flat' },
    { id: 'party', label: 'Events' },
    { id: 'couple', label: 'Couple' },
    { id: 'office', label: 'Office' }
  ];

  return (
    <div className="min-h-screen pb-24 max-w-lg mx-auto">
      {/* Fixed Sticky Header */}
      <header className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar name={currentUser?.name || 'User'} size="md" />
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                {currentUser?.name || 'User'}
              </h1>
              {currentUser?.phone ? (
                <p className="text-[11px] font-medium text-slate-500 leading-none mt-0.5 flex items-center gap-1">
                  <Phone className="h-2.5 w-2.5" /> {currentUser.phone}
                </p>
              ) : (
                <p className="text-[11px] font-medium text-slate-500 leading-none mt-0.5">
                  Welcome to Splitwise
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsJoinOpen(true)}
              className="text-xs h-8 px-2.5 gap-1.5 rounded-xl border-slate-200 bg-white"
            >
              <QrCode className="h-3.5 w-3.5 text-slate-500" />
              <span>Join</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="text-xs h-8 px-2.5 gap-1.5 rounded-xl"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Group</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4">
        {/* Overall Total Balance Card for This User */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 border-none shadow-md shadow-slate-900/10 mb-5 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {currentUser?.name ? `${currentUser.name}'s Net Balance` : 'Overall Net Balance'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl font-extrabold tracking-tight">
                {netBalance >= 0 ? '+' : '-'}
                {formatCurrency(Math.abs(netBalance), currency)}
              </h2>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  Math.abs(netBalance) < 0.01
                    ? 'bg-slate-700 text-slate-300'
                    : netBalance > 0
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {Math.abs(netBalance) < 0.01
                  ? 'All settled up'
                  : netBalance > 0
                  ? 'You are owed'
                  : 'You owe in total'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-700/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <TrendingUp className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                    You are owed
                  </p>
                  <p className="text-sm font-bold text-emerald-400">
                    +{formatCurrency(totalOwedToUser, currency)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                  <TrendingDown className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                    You owe
                  </p>
                  <p className="text-sm font-bold text-red-400">
                    -{formatCurrency(totalUserOwes, currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle decorative glow */}
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        </Card>

        {/* Search & Categories */}
        <div className="space-y-2.5 mb-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups or members..."
            leftIcon={<Search className="h-4 w-4" />}
            className="bg-white border-slate-200"
          />

          {/* Category Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Groups List Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              Your Expense Groups ({filteredGroups.length})
            </h2>
          </div>

          {filteredGroups.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {currentUser?.name ? `No groups found for ${currentUser.name}` : 'No groups found'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {currentUser?.phone
                    ? `Phone ${currentUser.phone} is not part of any group yet. Create a group or ask a friend to add this number!`
                    : 'Create a new group or join with an invite code.'}
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-2">
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Create Group
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsJoinOpen(true)}>
                  <QrCode className="h-3.5 w-3.5 mr-1 text-slate-500" /> Join Group
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <JoinGroupModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
      <AddExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
