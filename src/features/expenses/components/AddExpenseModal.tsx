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
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addExpense } from '@/features/expenses/expensesSlice';
import { generateId, CATEGORY_INFO } from '@/lib/utils';
import { Expense, ExpenseCategory, ExpenseSplit, Group, SplitType } from '@/types';
import { toast } from 'sonner';
import { Receipt, Calendar, FileText, Check } from 'lucide-react';

const expenseSchema = z.object({
  title: z.string().min(2, 'Description must be at least 2 characters').max(60),
  amount: z
    .number({ invalid_type_error: 'Enter a valid amount' })
    .positive('Amount must be greater than 0'),
  groupId: z.string().min(1, 'Please select a group'),
  paidById: z.string().min(1, 'Please select who paid'),
  category: z.string().min(1, 'Please select category'),
  date: z.string(),
  notes: z.string().max(200).optional()
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGroupId?: string;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  defaultGroupId
}: AddExpenseModalProps) {
  const dispatch = useAppDispatch();
  const groups = useAppSelector((state) => state.groups.groups);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    defaultGroupId || groups[0]?.id || ''
  );

  const currentGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  const [splitError, setSplitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: '',
      amount: undefined,
      groupId: defaultGroupId || groups[0]?.id || '',
      paidById: currentUser?.id || '',
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    }
  });

  const enteredAmount = watch('amount') || 0;
  const watchedPaidById = watch('paidById');

  useEffect(() => {
    if (defaultGroupId) {
      setSelectedGroupId(defaultGroupId);
      setValue('groupId', defaultGroupId);
    } else if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
      setValue('groupId', groups[0].id);
    }
  }, [defaultGroupId, groups, setValue, selectedGroupId]);

  useEffect(() => {
    if (currentUser && !watchedPaidById) {
      setValue('paidById', currentUser.id);
    }
  }, [currentUser, setValue, watchedPaidById]);

  // Handle group change
  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    setValue('groupId', groupId);
  };

  const onSubmit = (data: ExpenseFormData) => {
    if (!currentGroup) return;

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

    const newExpense: Expense = {
      id: generateId(),
      groupId: data.groupId,
      title: data.title,
      amount: data.amount,
      category: data.category as ExpenseCategory,
      date: new Date(data.date).toISOString(),
      paidById: data.paidById,
      splitType,
      splits,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'anonymous'
    };

    dispatch(addExpense(newExpense));
    toast.success(`Expense "${newExpense.title}" added!`);
    reset();
    setSplitType('equal');
    setSplits([]);
    onClose();
  };

  const currency = currentGroup?.currency || 'INR';

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Expense"
      description="Quickly record who paid and how the expense is split."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* Step 1: Select Group (if multiple and not pinned) */}
        {!defaultGroupId && groups.length > 1 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Group
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {groups.map((grp) => {
                const isSelected = grp.id === selectedGroupId;
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => handleGroupSelect(grp.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{grp.name}</span>
                  </button>
                );
              })}
            </div>
            {errors.groupId && (
              <p className="mt-1 text-xs text-red-500">{errors.groupId.message}</p>
            )}
          </div>
        )}

        {/* Step 2: Amount & Title */}
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
              autoFocus
              className="w-48 text-3xl font-extrabold text-slate-900 bg-transparent text-center focus:outline-none placeholder:text-slate-300"
              {...register('amount', { valueAsNumber: true })}
            />
          </div>
          {errors.amount && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.amount.message}</p>
          )}

          <div className="mt-3 pt-3 border-t border-slate-200/70">
            <Input
              placeholder="What was this expense for? (e.g. Dinner, Uber, Groceries)"
              className="text-center font-medium placeholder:font-normal bg-white"
              error={errors.title?.message}
              {...register('title')}
            />
          </div>
        </div>

        {/* Step 3: Paid By Selector */}
        {currentGroup && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Paid By
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentGroup.members.map((member) => {
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
        )}

        {/* Step 4: Split Selector */}
        {currentGroup && (
          <SplitSelector
            members={currentGroup.members}
            totalAmount={enteredAmount}
            currency={currency}
            splitType={splitType}
            onSplitTypeChange={setSplitType}
            splits={splits}
            onSplitsChange={setSplits}
            error={splitError || undefined}
          />
        )}

        {/* Step 5: Category & Date */}
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

        {/* Submit */}
        <div className="pt-2 flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-1/3">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-2/3 h-12 text-base">
            <Receipt className="h-4 w-4 mr-1.5" />
            Save Expense
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
