import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet } from '@/features/ui/Dialog';
import { Button } from '@/features/ui/Button';
import { Input } from '@/features/ui/Input';
import { Select } from '@/features/ui/Select';
import { Avatar } from '@/features/ui/Avatar';
import { SplitSelector } from './SplitSelector';
import { useAppDispatch } from '@/app/hooks';
import { updateExpense } from '@/features/expenses/expensesSlice';
import { saveExpenseToFirestore } from '@/features/api/firestoreService';
import { CATEGORY_INFO } from '@/lib/utils';
import { Expense, ExpenseCategory, ExpenseSplit, Group, SplitType } from '@/types';
import { toast } from 'sonner';
import { Save, Calendar, FileText, Check, Edit3 } from 'lucide-react';

const editExpenseSchema = z.object({
  title: z.string().min(2, 'Description must be at least 2 characters').max(60),
  amount: z
    .number({ invalid_type_error: 'Enter a valid amount' })
    .positive('Amount must be greater than 0'),
  paidById: z.string().min(1, 'Please select who paid'),
  category: z.string().min(1, 'Please select category'),
  date: z.string(),
  notes: z.string().max(200).optional()
});

type EditExpenseFormData = z.infer<typeof editExpenseSchema>;

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
  group: Group;
  onUpdated?: (updated: Expense) => void;
}

export function EditExpenseModal({
  isOpen,
  onClose,
  expense,
  group,
  onUpdated
}: EditExpenseModalProps) {
  const dispatch = useAppDispatch();

  const [splitType, setSplitType] = useState<SplitType>(expense.splitType || 'equal');
  const [splits, setSplits] = useState<ExpenseSplit[]>(expense.splits || []);
  const [splitError, setSplitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<EditExpenseFormData>({
    resolver: zodResolver(editExpenseSchema),
    defaultValues: {
      title: expense.title,
      amount: expense.amount,
      paidById: expense.paidById,
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
      notes: expense.notes || ''
    }
  });

  const enteredAmount = watch('amount') || 0;
  const watchedPaidById = watch('paidById');

  // Sync when expense prop changes
  useEffect(() => {
    reset({
      title: expense.title,
      amount: expense.amount,
      paidById: expense.paidById,
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
      notes: expense.notes || ''
    });
    setSplitType(expense.splitType || 'equal');
    setSplits(expense.splits || []);
  }, [expense, reset]);

  const onSubmit = (data: EditExpenseFormData) => {
    // Validate splits
    if (splits.length === 0) {
      setSplitError('At least one member must be included in the split');
      return;
    }

    const splitsTotal = splits.reduce((sum, s) => sum + s.amount, 0);
    const difference = Math.abs(splitsTotal - data.amount);

    if (difference > 0.05) {
      setSplitError(
        `Total splits sum (${splitsTotal.toFixed(2)}) must match expense amount (${data.amount.toFixed(2)})`
      );
      return;
    }

    setSplitError(null);

    const updatedExpense: Expense = {
      ...expense,
      title: data.title.trim(),
      amount: data.amount,
      category: data.category as ExpenseCategory,
      date: new Date(data.date).toISOString(),
      paidById: data.paidById,
      splitType,
      splits,
      notes: data.notes?.trim() || ''
    };

    dispatch(updateExpense(updatedExpense));
    saveExpenseToFirestore(updatedExpense).catch((err) =>
      console.warn('Updated expense locally; Firestore sync pending:', err)
    );

    toast.success(`Expense "${updatedExpense.title}" updated successfully!`);
    if (onUpdated) onUpdated(updatedExpense);
    onClose();
  };

  const currency = group.currency || 'INR';

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Expense"
      description={`Editing expense in ${group.name}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* Amount & Title */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-center">
          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
            Expense Amount ({currency})
          </label>
          <div className="flex items-center justify-center">
            <span className="text-3xl font-bold text-slate-400 mr-1.5">
              {currency === 'INR' ? '₹' : '$'}
            </span>
            <input
              type="number"
              step="any"
              min="0.01"
              placeholder="0.00"
              className="w-48 text-3xl font-extrabold text-slate-900 bg-transparent text-center focus:outline-none placeholder:text-slate-300"
              {...register('amount', { valueAsNumber: true })}
            />
          </div>
          {errors.amount && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.amount.message}</p>
          )}

          <div className="mt-3 pt-3 border-t border-slate-200/70">
            <Input
              placeholder="Description (e.g. Dinner, Uber, Groceries)"
              className="text-center font-medium placeholder:font-normal bg-white"
              error={errors.title?.message}
              {...register('title')}
            />
          </div>
        </div>

        {/* Paid By Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Paid By
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {group.members.map((member) => {
              const isSelected = watchedPaidById === member.id;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setValue('paidById', member.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <Avatar name={member.name} size="sm" />
                  <span className="text-xs font-medium text-slate-800 line-clamp-1 flex-1">
                    {member.name}
                  </span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
          {errors.paidById && (
            <p className="mt-1 text-xs text-red-500">{errors.paidById.message}</p>
          )}
        </div>

        {/* Split Selector */}
        <SplitSelector
          members={group.members}
          totalAmount={enteredAmount}
          currency={currency}
          splitType={splitType}
          onSplitTypeChange={setSplitType}
          splits={splits}
          onSplitsChange={setSplits}
          error={splitError || undefined}
        />

        {/* Category & Date */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <Select
              label="Category"
              options={Object.entries(CATEGORY_INFO).map(([key, val]) => ({
                value: key,
                label: val.label
              }))}
              {...register('category')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
            <Input
              type="date"
              leftIcon={<Calendar className="h-4 w-4" />}
              {...register('date')}
            />
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <Input
            placeholder="Add optional notes (e.g. Paid via Google Pay)"
            leftIcon={<FileText className="h-4 w-4" />}
            {...register('notes')}
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-1/3">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-2/3 h-12 text-base font-semibold">
            <Save className="h-4 w-4 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
