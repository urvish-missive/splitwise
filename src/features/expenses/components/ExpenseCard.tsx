import React, { useState } from 'react';
import { Expense, Group } from '@/types';
import { Card } from '@/features/ui/Card';
import { CATEGORY_INFO, formatCurrency, formatDate, findMemberForUser } from '@/lib/utils';
import { useAppSelector } from '@/app/hooks';
import {
  UtensilsCrossed,
  Car,
  Home,
  Film,
  ShoppingBag,
  Tag,
  Zap,
  Receipt,
  FileText
} from 'lucide-react';
import { ExpenseDetailsModal } from './ExpenseDetailsModal';

interface ExpenseCardProps {
  expense: Expense;
  group: Group;
}

const CATEGORY_ICON_COMPONENTS: Record<string, React.ElementType> = {
  UtensilsCrossed,
  Car,
  Home,
  Film,
  ShoppingBag,
  Tag,
  Zap,
  Receipt
};

export function ExpenseCard({ expense, group }: ExpenseCardProps) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [showDetails, setShowDetails] = useState(false);

  const payer = group.members.find((m) => m.id === expense.paidById);
  const currentMember = findMemberForUser(group.members, currentUser);
  const myMemberId = currentMember?.id || currentUser?.id;
  const isPayerCurrentUser = myMemberId === expense.paidById;

  // Calculate current user's personal share
  const mySplit = expense.splits.find((s) => s.memberId === myMemberId);
  const myOwedShare = mySplit ? mySplit.amount : 0;

  // Status for current user
  let statusText = '';
  let statusColor = '';
  let statusAmount = 0;

  if (isPayerCurrentUser) {
    // You paid. You lent: Total - your own share
    const lentAmount = expense.amount - myOwedShare;
    if (lentAmount > 0.01) {
      statusText = 'you lent';
      statusColor = 'text-emerald-600 font-bold';
      statusAmount = lentAmount;
    } else {
      statusText = 'you paid for yourself';
      statusColor = 'text-slate-500 font-medium';
      statusAmount = expense.amount;
    }
  } else {
    // Someone else paid
    if (myOwedShare > 0.01) {
      statusText = 'you borrowed';
      statusColor = 'text-red-600 font-bold';
      statusAmount = myOwedShare;
    } else {
      statusText = 'not involved';
      statusColor = 'text-slate-400 font-normal';
      statusAmount = 0;
    }
  }

  const categoryMeta = CATEGORY_INFO[expense.category] || CATEGORY_INFO.general;
  const IconComponent = CATEGORY_ICON_COMPONENTS[categoryMeta.icon] || Receipt;

  return (
    <>
      <Card
        onClick={() => setShowDetails(true)}
        className="cursor-pointer hover:border-slate-300 hover:shadow-xs transition-all active:scale-[0.99] p-3.5 border-slate-200/80"
      >
        <div className="flex items-center justify-between">
          {/* Left: Icon & Title */}
          <div className="flex items-center space-x-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${categoryMeta.bg} ${categoryMeta.text}`}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                {expense.title}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                <span className="font-medium text-slate-700">
                  {isPayerCurrentUser ? 'You' : payer?.name || 'Someone'}
                </span>{' '}
                paid {formatCurrency(expense.amount, group.currency)} •{' '}
                {formatDate(expense.date)}
              </p>
            </div>
          </div>

          {/* Right: Net user impact */}
          <div className="text-right shrink-0 pl-2">
            <p className="text-[11px] text-slate-400 uppercase tracking-tight">{statusText}</p>
            {statusAmount > 0 ? (
              <p className={`text-sm ${statusColor}`}>
                {isPayerCurrentUser ? '+' : '-'}
                {formatCurrency(statusAmount, group.currency)}
              </p>
            ) : (
              <p className="text-xs text-slate-400 font-medium">--</p>
            )}
          </div>
        </div>

        {expense.notes && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <FileText className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="line-clamp-1 italic">{expense.notes}</span>
          </div>
        )}
      </Card>

      <ExpenseDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        expense={expense}
        group={group}
      />
    </>
  );
}
