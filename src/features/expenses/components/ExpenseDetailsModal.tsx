import React, { useState } from 'react';
import { Expense, Group } from '@/types';
import { Dialog } from '@/features/ui/Dialog';
import { Button } from '@/features/ui/Button';
import { Avatar } from '@/features/ui/Avatar';
import { EditExpenseModal } from './EditExpenseModal';
import { formatCurrency, formatDate, CATEGORY_INFO, findMemberForUser } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { deleteExpense } from '@/features/expenses/expensesSlice';
import { deleteExpenseFromFirestore } from '@/features/api/firestoreService';
import { toast } from 'sonner';
import { Trash2, Calendar, FileText, Edit3, UserCheck, ArrowRight, Phone } from 'lucide-react';

interface ExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
  group: Group;
}

export function ExpenseDetailsModal({
  isOpen,
  onClose,
  expense: initialExpense,
  group
}: ExpenseDetailsModalProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [expense, setExpense] = useState<Expense>(initialExpense);

  // Sync state if initialExpense changes
  React.useEffect(() => {
    setExpense(initialExpense);
  }, [initialExpense]);

  const payer = group.members.find((m) => m.id === expense.paidById);
  const currentMember = findMemberForUser(group.members, currentUser);
  const isPayerCurrentUser = (currentMember?.id || currentUser?.id) === expense.paidById;

  const categoryMeta = CATEGORY_INFO[expense.category] || CATEGORY_INFO.general;

  const handleDelete = () => {
    if (window.confirm(`Delete expense "${expense.title}"?`)) {
      dispatch(deleteExpense(expense.id));
      deleteExpenseFromFirestore(expense.id).catch((err) =>
        console.warn('Deleted locally; Firestore delete pending:', err)
      );
      toast.success('Expense deleted');
      onClose();
    }
  };

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title={expense.title}
        description={`Recorded in ${group.name}`}
      >
        <div className="space-y-4 pt-1">
          {/* Total Header Card */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-center">
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Total Amount
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {formatCurrency(expense.amount, group.currency)}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                {categoryMeta.label}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(expense.date)}
              </span>
            </div>
          </div>

          {/* 1. Paid By Card */}
          <div className="rounded-xl border border-slate-200 p-3.5 bg-white">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Paid By
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar name={payer?.name || 'Someone'} size="md" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-900">
                      {isPayerCurrentUser ? `${payer?.name || 'You'} (You)` : payer?.name || 'Unknown'}
                    </p>
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded-full">
                      Payer
                    </span>
                  </div>
                  {payer?.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="h-2.5 w-2.5" /> {payer.phone}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400">Total Paid</p>
                <p className="text-sm font-extrabold text-slate-900">
                  {formatCurrency(expense.amount, group.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Paid To Whom / Split Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Paid To Whom / Split With ({expense.splitType})
                </h4>
                <p className="text-[11px] text-slate-400">
                  Whom this was paid for & each person's exact share
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {expense.splits.length} {expense.splits.length === 1 ? 'person' : 'people'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white overflow-hidden shadow-2xs">
              {expense.splits.map((split) => {
                const member = group.members.find((m) => m.id === split.memberId);
                const isThisPayer = split.memberId === expense.paidById;
                const isThisCurrent = (currentMember?.id || currentUser?.id) === split.memberId;

                return (
                  <div
                    key={split.memberId}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Avatar name={member?.name || 'Member'} size="sm" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-800">
                            {member?.name || 'Member'}
                            {isThisCurrent && ' (You)'}
                          </p>
                          {isThisPayer && (
                            <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.2 rounded-full">
                              Payer
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {isThisPayer
                            ? 'Paid for own share'
                            : `Owes ${payer?.name || 'Payer'} ${formatCurrency(split.amount, group.currency)}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">
                        {formatCurrency(split.amount, group.currency)}
                      </p>
                      {split.percentage !== undefined && (
                        <p className="text-[10px] text-slate-400">
                          {split.percentage}% of total
                        </p>
                      )}
                      {split.shares !== undefined && (
                        <p className="text-[10px] text-slate-400">
                          {split.shares} {split.shares === 1 ? 'share' : 'shares'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          {expense.notes && (
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 flex items-start gap-2">
              <FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-700">Notes:</p>
                <p className="mt-0.5">{expense.notes}</p>
              </div>
            </div>
          )}

          {/* Edit & Delete Actions */}
          <div className="pt-2 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(true)}
              className="w-full text-slate-800 border-slate-200 hover:bg-slate-50 font-semibold"
            >
              <Edit3 className="h-4 w-4 mr-1.5 text-blue-600" />
              Edit Expense
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="w-full font-semibold"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Expense Modal */}
      {isEditOpen && (
        <EditExpenseModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          expense={expense}
          group={group}
          onUpdated={(updated) => setExpense(updated)}
        />
      )}
    </>
  );
}
