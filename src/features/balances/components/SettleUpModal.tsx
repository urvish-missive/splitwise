import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet } from '@/features/ui/Dialog';
import { Button } from '@/features/ui/Button';
import { Input } from '@/features/ui/Input';
import { Select } from '@/features/ui/Select';
import { Avatar } from '@/features/ui/Avatar';
import { Group, Settlement } from '@/types';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addSettlement } from '@/features/expenses/expensesSlice';
import { saveSettlementToFirestore } from '@/features/api/firestoreService';
import { generateId, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle2, DollarSign } from 'lucide-react';

const settlementSchema = z.object({
  payerId: z.string().min(1, 'Please select who is paying'),
  receiverId: z.string().min(1, 'Please select who receives the payment'),
  amount: z
    .number({ invalid_type_error: 'Enter a valid payment amount' })
    .positive('Amount must be greater than 0'),
  date: z.string(),
  notes: z.string().max(150).optional()
});

type SettlementFormData = z.infer<typeof settlementSchema>;

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  initialPayerId?: string;
  initialReceiverId?: string;
  initialAmount?: number;
}

export function SettleUpModal({
  isOpen,
  onClose,
  group,
  initialPayerId,
  initialReceiverId,
  initialAmount
}: SettleUpModalProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<SettlementFormData>({
    resolver: zodResolver(settlementSchema),
    defaultValues: {
      payerId: initialPayerId || currentUser?.id || group.members[0]?.id || '',
      receiverId:
        initialReceiverId ||
        group.members.find((m) => m.id !== (initialPayerId || currentUser?.id))?.id ||
        '',
      amount: initialAmount || undefined,
      date: new Date().toISOString().split('T')[0],
      notes: ''
    }
  });

  const payerId = watch('payerId');
  const receiverId = watch('receiverId');

  useEffect(() => {
    if (initialPayerId) setValue('payerId', initialPayerId);
    if (initialReceiverId) setValue('receiverId', initialReceiverId);
    if (initialAmount) setValue('amount', initialAmount);
  }, [initialPayerId, initialReceiverId, initialAmount, setValue]);

  const payer = group.members.find((m) => m.id === payerId);
  const receiver = group.members.find((m) => m.id === receiverId);

  const onSubmit = (data: SettlementFormData) => {
    if (data.payerId === data.receiverId) {
      toast.error('Payer and receiver cannot be the same person.');
      return;
    }

    const newSettlement: Settlement = {
      id: generateId(),
      groupId: group.id,
      payerId: data.payerId,
      receiverId: data.receiverId,
      amount: data.amount,
      date: new Date(data.date).toISOString(),
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'anonymous'
    };

    dispatch(addSettlement(newSettlement));
    saveSettlementToFirestore(newSettlement).catch((err) =>
      console.warn('Saved settlement locally; Firestore sync pending:', err)
    );
    toast.success(
      `Recorded payment of ${formatCurrency(data.amount, group.currency)}!`
    );
    reset();
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Record a Settlement"
      description={`Record cash, UPI, or bank transfers between members in ${group.name}.`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* Visual Who Pays Who banner */}
        <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 flex items-center justify-around">
          <div className="text-center">
            <Avatar name={payer?.name || 'Payer'} size="lg" className="mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[110px]">
              {payer?.name || 'Select Payer'}
            </p>
            <span className="text-[10px] text-blue-600 font-medium">Payer</span>
          </div>

          <div className="flex flex-col items-center px-2">
            <ArrowRight className="h-6 w-6 text-blue-600 stroke-[2.5]" />
            <span className="text-[10px] text-slate-400 mt-1">pays</span>
          </div>

          <div className="text-center">
            <Avatar
              name={receiver?.name || 'Receiver'}
              size="lg"
              className="mx-auto mb-1.5"
            />
            <p className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[110px]">
              {receiver?.name || 'Select Receiver'}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">Receiver</span>
          </div>
        </div>

        {/* Payer and Receiver Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Select
              label="Who Paid?"
              options={group.members.map((m) => ({
                value: m.id,
                label: m.name
              }))}
              error={errors.payerId?.message}
              {...register('payerId')}
            />
          </div>

          <div>
            <Select
              label="Who Received?"
              options={group.members.map((m) => ({
                value: m.id,
                label: m.name
              }))}
              error={errors.receiverId?.message}
              {...register('receiverId')}
            />
          </div>
        </div>

        {/* Settlement Amount */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-center">
          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
            Settlement Amount ({group.currency})
          </label>
          <div className="flex items-center justify-center">
            <span className="text-3xl font-bold text-slate-400 mr-1.5">
              {group.currency === 'INR' ? '₹' : '$'}
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
        </div>

        {/* Date & Payment Method/Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Payment Date
            </label>
            <Input type="date" {...register('date')} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Method / Note
            </label>
            <Input
              placeholder="e.g. GPay, Cash, Venmo"
              {...register('notes')}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-1/3">
            Cancel
          </Button>
          <Button type="submit" variant="success" isLoading={isSubmitting} className="w-2/3 h-12 text-base">
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Save Settlement
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
