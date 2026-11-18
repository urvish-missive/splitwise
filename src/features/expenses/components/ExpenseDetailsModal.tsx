import React from 'react';
import { Expense, Group } from '@/types';
import { Dialog } from '@/features/ui/Dialog';
import { Button } from '@/features/ui/Button';
import { Avatar } from '@/features/ui/Avatar';
import { formatCurrency, formatDate, CATEGORY_INFO } from '@/lib/utils';
import { useAppDispatch } from '@/app/hooks';
import { deleteExpense } from '@/features/expenses/expensesSlice';
import { deleteExpenseFromFirestore } from '@/features/api/firestoreService';
import { toast } from 'sonner';
import { Trash2, Calendar, FileText } from 'lucide-react';

interface ExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
  group: Group;
}

export function ExpenseDetailsModal({
  isOpen,
  onClose,
  expense,
  group
}: ExpenseDetailsModalProps) {
  const dispatch = useAppDispatch();

  const payer = group.members.find((m) => m.id === expense.paidById);
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
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={expense.title}
      description={`Added in ${group.name}`}
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

        {/* Payer Info */}
        <div className="rounded-xl border border-slate-200 p-3 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <Avatar name={payer?.name || 'Someone'} size="md" />
            <div>
              <p className="text-xs text-slate-500">Paid full amount</p>
              <p className="text-sm font-semibold text-slate-900">
                {payer?.name || 'Unknown'}
              </p>
            </div>
          </div>
          <p className="text-sm font-bold text-slate-900">
            {formatCurrency(expense.amount, group.currency)}
          </p>
        </div>

        {/* Splits Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Split Breakdown ({expense.splitType})
            </h4>
            <span className="text-xs text-slate-400">
              {expense.splits.length} {expense.splits.length === 1 ? 'person' : 'people'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white overflow-hidden">
            {expense.splits.map((split) => {
              const member = group.members.find((m) => m.id === split.memberId);
              return (
                <div
                  key={split.memberId}
                  className="flex items-center justify-between p-2.5"
                >
                  <div className="flex items-center space-x-2.5">
                    <Avatar name={member?.name || 'Member'} size="sm" />
                    <div>
                      <p className="text-xs font-medium text-slate-800">
                        {member?.name || 'Member'}
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
                  <p className="text-xs font-semibold text-slate-900">
                    {formatCurrency(split.amount, group.currency)}
                  </p>
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

        {/* Delete Action */}
        <div className="pt-2 flex gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete Expense
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
