import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { deleteGroup } from '@/features/groups/groupsSlice';
import { setExpenses, setSettlements } from '@/features/expenses/expensesSlice';
import {
  deleteGroupFromFirestore,
  subscribeToGroupExpenses,
  subscribeToGroupSettlements
} from '@/features/api/firestoreService';
import { isFirebaseConfigured } from '@/lib/firebase';
import { ExpenseCard } from '@/features/expenses/components/ExpenseCard';
import { AddExpenseModal } from '@/features/expenses/components/AddExpenseModal';
import { SettleUpModal } from '@/features/balances/components/SettleUpModal';
import { InviteShareModal } from '@/features/groups/components/InviteShareModal';
import { AddMemberModal } from '@/features/groups/components/AddMemberModal';
import { EditGroupModal } from '@/features/groups/components/EditGroupModal';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { BalancesSummary } from '@/features/balances/components/BalancesSummary';
import { DebtSimplificationCard } from '@/features/balances/components/DebtSimplificationCard';
import { calculateGroupBalances } from '@/features/balances/balanceCalculator';
import { Button } from '@/features/ui/Button';
import { Card } from '@/features/ui/Card';
import { Tabs } from '@/features/ui/Tabs';
import { Avatar } from '@/features/ui/Avatar';
import { Badge } from '@/features/ui/Badge';
import { formatCurrency, GROUP_CATEGORY_INFO, findMemberForUser, isSamePhone } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Share2,
  UserPlus,
  Plus,
  Receipt,
  CheckCircle2,
  Trash2,
  Users,
  Copy,
  Check,
  Edit3
} from 'lucide-react';

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const groups = useAppSelector((state) => state.groups.groups);
  const currentUser = useAppSelector((state) => state.auth.user);
  const allExpenses = useAppSelector((state) => state.expenses.expenses);
  const allSettlements = useAppSelector((state) => state.expenses.settlements);

  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'members'>('expenses');
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [expenseFilterCategory, setExpenseFilterCategory] = useState('all');
  const [quickCopied, setQuickCopied] = useState(false);

  const group = groups.find((g) => g.id === groupId);

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-base font-semibold text-slate-800">Group not found</p>
          <Button onClick={() => navigate('/')}>Back to Groups</Button>
        </div>
      </div>
    );
  }

  const groupExpenses = allExpenses.filter((e) => e.groupId === group.id);
  const groupSettlements = allSettlements.filter((s) => s.groupId === group.id);

  const balanceCalculation = calculateGroupBalances(
    group.members,
    groupExpenses,
    groupSettlements
  );

  const currentMember = findMemberForUser(group.members, currentUser);

  const userBalance = currentMember
    ? balanceCalculation.memberBalances[currentMember.id]?.netBalance || 0
    : 0;

  const categoryMeta = GROUP_CATEGORY_INFO[group.category] || GROUP_CATEGORY_INFO.other;

  // Filter expenses
  const filteredExpenses = groupExpenses.filter((exp) => {
    return expenseFilterCategory === 'all' || exp.category === expenseFilterCategory;
  });

  // Real-time Firestore sync for expenses and settlements of this group
  React.useEffect(() => {
    if (!isFirebaseConfigured || !group?.id) return;

    const unsubExpenses = subscribeToGroupExpenses(group.id, (remoteExpenses) => {
      if (remoteExpenses && remoteExpenses.length > 0) {
        // Merge remote expenses with current store
        dispatch((dispatchThunk, getState) => {
          const current = getState().expenses.expenses;
          const otherGroupExpenses = current.filter((e) => e.groupId !== group.id);
          dispatch(setExpenses([...remoteExpenses, ...otherGroupExpenses]));
        });
      }
    });

    const unsubSettlements = subscribeToGroupSettlements(group.id, (remoteSettlements) => {
      if (remoteSettlements && remoteSettlements.length > 0) {
        dispatch((dispatchThunk, getState) => {
          const current = getState().expenses.settlements;
          const otherSettlements = current.filter((s) => s.groupId !== group.id);
          dispatch(setSettlements([...remoteSettlements, ...otherSettlements]));
        });
      }
    });

    return () => {
      if (unsubExpenses) unsubExpenses();
      if (unsubSettlements) unsubSettlements();
    };
  }, [group?.id, dispatch]);

  const handleDeleteGroup = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${group.name}"? All expenses in this group will be deleted.`
      )
    ) {
      dispatch(deleteGroup(group.id));
      deleteGroupFromFirestore(group.id).catch((err) =>
        console.warn('Deleted locally; Firestore delete pending:', err)
      );
      toast.success('Group deleted');
      navigate('/');
    }
  };

  const handleQuickCopyLink = async () => {
    const baseUrl = import.meta.env.VITE_APP_URL?.trim() || window.location.origin;
    const inviteLink = `${baseUrl}/join?code=${group.inviteCode}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setQuickCopied(true);
      toast.success('Group invite link copied to clipboard!');
      setTimeout(() => setQuickCopied(false), 2000);
    } catch {
      setIsInviteOpen(true);
    }
  };

  return (
    <div className="min-h-screen pb-24 max-w-lg mx-auto">
      {/* Fixed Sticky Navigation Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md px-4 py-2.5 border-b border-slate-200/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 flex-1 min-w-0 pr-2">
            <button
              onClick={() => navigate('/')}
              className="rounded-full p-1.5 -ml-1 text-slate-600 hover:bg-slate-200/70 transition-colors shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-slate-900 truncate">{group.name}</h1>
                <span
                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full shrink-0 ${categoryMeta.color}`}
                >
                  {categoryMeta.label}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {group.members.length} {group.members.length === 1 ? 'member' : 'members'} • Code: {group.inviteCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Prominent Share Button */}
            <Button
              size="sm"
              onClick={() => setIsInviteOpen(true)}
              className="h-8 px-2.5 text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5 font-semibold"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditGroupOpen(true)}
              className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-200/60"
              title="Edit Group Details"
            >
              <Edit3 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAddMemberOpen(true)}
              className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-200/60"
              title="Add Member"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteGroup}
              className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50"
              title="Delete Group"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4">
        {!currentUser && (
          <div className="bg-blue-50 border border-blue-200/90 rounded-2xl p-3 mb-3.5 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-blue-900">Signed out: </span>
              <span className="text-blue-800">
                Sign in with your Phone & PIN to add expenses & settle up.
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAuthOpen(true)}
              className="shrink-0 text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sign In
            </Button>
          </div>
        )}

        {group.description && (
          <p className="text-xs text-slate-500 mb-3 -mt-1">{group.description}</p>
        )}

        {/* User Balance In This Group Banner */}
        <Card className="bg-slate-900 text-white p-4 mb-4 border-none shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Your Group Balance
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-extrabold tracking-tight">
                  {userBalance >= 0 ? '+' : '-'}
                  {formatCurrency(Math.abs(userBalance), group.currency)}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    Math.abs(userBalance) < 0.01
                      ? 'bg-slate-800 text-slate-300'
                      : userBalance > 0
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {Math.abs(userBalance) < 0.01
                    ? 'Settled up'
                    : userBalance > 0
                    ? 'You are owed'
                    : 'You owe'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Total Spent</span>
              <span className="text-sm font-bold text-slate-200">
                {formatCurrency(balanceCalculation.totalGroupExpenses, group.currency)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 relative z-10">
            <Button
              onClick={() => {
                if (!currentUser) {
                  toast.info('Please sign in with your phone and PIN first');
                  setIsAuthOpen(true);
                  return;
                }
                setIsExpenseOpen(true);
              }}
              className="h-10 text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>

            <Button
              onClick={() => {
                if (!currentUser) {
                  toast.info('Please sign in with your phone and PIN first');
                  setIsAuthOpen(true);
                  return;
                }
                setIsSettleOpen(true);
              }}
              variant="outline"
              className="h-10 text-xs font-semibold gap-1.5 border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Settle Up
            </Button>
          </div>
        </Card>

        {/* Quick Share Banner Card */}
        <div className="mb-4 p-3 rounded-2xl bg-blue-50/70 border border-blue-200/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Share group with friends</p>
              <p className="text-[10px] text-slate-500">
                Code: <span className="font-mono font-bold text-blue-700">{group.inviteCode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleQuickCopyLink}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              {quickCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              <span>{quickCopied ? 'Copied' : 'Copy'}</span>
            </button>
            <Button
              size="sm"
              onClick={() => setIsInviteOpen(true)}
              className="h-7 px-2.5 text-[11px] rounded-xl font-semibold"
            >
              Share Options
            </Button>
          </div>
        </div>

        {/* Tabs: Expenses | Balances | Members */}
        <Tabs
          tabs={[
            { id: 'expenses', label: 'Expenses', count: groupExpenses.length },
            { id: 'balances', label: 'Balances' },
            { id: 'members', label: 'Members', count: group.members.length }
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
          className="mb-4"
        />

        {/* Tab 1: Expenses List */}
        {activeTab === 'expenses' && (
          <div className="space-y-3">
            {filteredExpenses.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Receipt className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">No expenses yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Add dinner, rent, tickets, or travel costs to split with the group.
                  </p>
                </div>
                <Button size="sm" onClick={() => setIsExpenseOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add First Expense
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredExpenses.map((expense) => (
                  <ExpenseCard key={expense.id} expense={expense} group={group} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Balances & Simplified Debts */}
        {activeTab === 'balances' && (
          <div className="space-y-4">
            <DebtSimplificationCard
              group={group}
              debts={balanceCalculation.simplifiedDebts}
            />
            <BalancesSummary group={group} balanceCalculation={balanceCalculation} />
          </div>
        )}

        {/* Tab 3: Group Members */}
        {activeTab === 'members' && (
          <div className="space-y-3">
            <Card className="border-slate-200/80">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Group Members ({group.members.length})
                </h4>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsInviteOpen(true)}
                    className="text-xs h-8 px-2.5 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Share2 className="h-3.5 w-3.5 mr-1" /> Share Link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddMemberOpen(true)}
                    className="text-xs h-8 px-2.5"
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 pt-1">
                {group.members.map((member) => {
                  const isYou =
                    member.id === currentMember?.id ||
                    (currentUser?.phone && member.phone && isSamePhone(member.phone, currentUser.phone));

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between py-3 first:pt-2 last:pb-1"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar name={member.name} size="md" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                            {isYou && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          {member.phone && (
                            <p className="text-xs text-slate-500">{member.phone}</p>
                          )}
                          {member.email && !member.phone && (
                            <p className="text-xs text-slate-500">{member.email}</p>
                          )}
                        </div>
                      </div>

                      {member.id === group.createdBy && (
                        <Badge variant="outline" className="text-[10px]">
                          Creator
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        defaultGroupId={group.id}
      />
      <SettleUpModal
        isOpen={isSettleOpen}
        onClose={() => setIsSettleOpen(false)}
        group={group}
      />
      <InviteShareModal
        group={group}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
      <AddMemberModal
        group={group}
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />
      <EditGroupModal
        group={group}
        isOpen={isEditGroupOpen}
        onClose={() => setIsEditGroupOpen(false)}
      />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}
