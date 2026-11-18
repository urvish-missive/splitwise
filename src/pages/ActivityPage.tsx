import React from 'react';
import { useAppSelector } from '@/app/hooks';
import { Card } from '@/features/ui/Card';
import { Avatar } from '@/features/ui/Avatar';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Clock, Receipt, CheckCircle2, ArrowRight } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'expense' | 'settlement';
  title: string;
  amount: number;
  date: string;
  groupName: string;
  currency: any;
  payerName: string;
  receiverName?: string;
  userImpact?: {
    text: string;
    amount: number;
    isPositive: boolean;
  };
}

export function ActivityPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const groups = useAppSelector((state) => state.groups.groups);
  const allExpenses = useAppSelector((state) => state.expenses.expenses);
  const allSettlements = useAppSelector((state) => state.expenses.settlements);

  const activities: ActivityItem[] = [];

  // Map expenses to activity
  allExpenses.forEach((exp) => {
    const group = groups.find((g) => g.id === exp.groupId);
    if (!group) return;

    const payer = group.members.find((m) => m.id === exp.paidById);
    const isPayerCurrentUser = currentUser?.id === exp.paidById;
    const mySplit = exp.splits.find((s) => s.memberId === currentUser?.id);
    const myOwedShare = mySplit ? mySplit.amount : 0;

    let userImpact;
    if (isPayerCurrentUser) {
      const lent = exp.amount - myOwedShare;
      if (lent > 0.01) {
        userImpact = { text: 'you lent', amount: lent, isPositive: true };
      }
    } else if (myOwedShare > 0.01) {
      userImpact = { text: 'you borrowed', amount: myOwedShare, isPositive: false };
    }

    activities.push({
      id: exp.id,
      type: 'expense',
      title: exp.title,
      amount: exp.amount,
      date: exp.date,
      groupName: group.name,
      currency: group.currency,
      payerName: isPayerCurrentUser ? 'You' : payer?.name || 'Someone',
      userImpact
    });
  });

  // Map settlements to activity
  allSettlements.forEach((stl) => {
    const group = groups.find((g) => g.id === stl.groupId);
    if (!group) return;

    const payer = group.members.find((m) => m.id === stl.payerId);
    const receiver = group.members.find((m) => m.id === stl.receiverId);

    const isPayerCurrentUser = currentUser?.id === stl.payerId;
    const isReceiverCurrentUser = currentUser?.id === stl.receiverId;

    let userImpact;
    if (isPayerCurrentUser) {
      userImpact = { text: 'you paid', amount: stl.amount, isPositive: true };
    } else if (isReceiverCurrentUser) {
      userImpact = { text: 'you received', amount: stl.amount, isPositive: false };
    }

    activities.push({
      id: stl.id,
      type: 'settlement',
      title: `${isPayerCurrentUser ? 'You' : payer?.name || 'Someone'} paid ${
        isReceiverCurrentUser ? 'you' : receiver?.name || 'Someone'
      }`,
      amount: stl.amount,
      date: stl.date,
      groupName: group.name,
      currency: group.currency,
      payerName: payer?.name || 'Payer',
      receiverName: receiver?.name || 'Receiver',
      userImpact
    });
  });

  // Sort by date descending
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen pb-24 max-w-lg mx-auto">
      {/* Fixed Sticky Header */}
      <header className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/70 shadow-2xs">
        <h1 className="text-base font-bold text-slate-900 leading-tight">Recent Activity</h1>
        <p className="text-[11px] text-slate-500 mt-0.5">
          History of all shared expenses and settlements
        </p>
      </header>

      <div className="px-4 pt-4">
        {activities.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Clock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No activity yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Expenses and payments will show up here as they happen.
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {activities.map((item) => (
              <Card key={item.id} className="p-3.5 border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        item.type === 'settlement'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.type === 'settlement' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Receipt className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">{item.groupName}</span>{' '}
                        • {formatDate(item.date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(item.amount, item.currency)}
                    </p>
                    {item.userImpact && (
                      <p
                        className={`text-[11px] font-semibold ${
                          item.userImpact.isPositive
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        {item.userImpact.text}{' '}
                        {formatCurrency(item.userImpact.amount, item.currency)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
