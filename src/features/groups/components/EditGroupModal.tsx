import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/features/ui/Dialog';
import { Button } from '@/features/ui/Button';
import { Input } from '@/features/ui/Input';
import { Select } from '@/features/ui/Select';
import { useAppDispatch } from '@/app/hooks';
import { updateGroup } from '@/features/groups/groupsSlice';
import { saveGroupToFirestore } from '@/features/api/firestoreService';
import { CurrencyCode, Group, GroupCategory } from '@/types';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

const editGroupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters').max(50),
  category: z.enum(['trip', 'home', 'couple', 'party', 'office', 'other']),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED']),
  description: z.string().max(120).optional()
});

type EditGroupFormValues = z.infer<typeof editGroupSchema>;

interface EditGroupModalProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
}

export function EditGroupModal({ group, isOpen, onClose }: EditGroupModalProps) {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<EditGroupFormValues>({
    resolver: zodResolver(editGroupSchema),
    defaultValues: {
      name: group.name,
      category: group.category,
      currency: group.currency,
      description: group.description || ''
    }
  });

  const onSubmit = (data: EditGroupFormValues) => {
    const updatedGroup: Group = {
      ...group,
      name: data.name.trim(),
      category: data.category as GroupCategory,
      currency: data.currency as CurrencyCode,
      description: data.description?.trim() || '',
      updatedAt: new Date().toISOString()
    };

    dispatch(updateGroup(updatedGroup));
    saveGroupToFirestore(updatedGroup).catch((err) =>
      console.warn('Updated group locally; Firestore sync pending:', err)
    );

    toast.success(`Group "${updatedGroup.name}" updated!`);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Group Details"
      description="Update group name, category, or description."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Group Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Goa Trip, Flat 402"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Select
              label="Category"
              options={[
                { value: 'trip', label: 'Trip & Travel' },
                { value: 'home', label: 'Flat & Home' },
                { value: 'party', label: 'Party & Event' },
                { value: 'couple', label: 'Couple' },
                { value: 'office', label: 'Office' },
                { value: 'other', label: 'Other' }
              ]}
              {...register('category')}
            />
          </div>

          <div>
            <Select
              label="Currency"
              options={[
                { value: 'INR', label: 'INR (₹)' },
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
                { value: 'AUD', label: 'AUD (A$)' },
                { value: 'CAD', label: 'CAD (C$)' },
                { value: 'SGD', label: 'SGD (S$)' },
                { value: 'AED', label: 'AED' }
              ]}
              {...register('currency')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <Input
            placeholder="Short note about the purpose of this group"
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <div className="pt-2 flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-1/3">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-2/3 font-semibold">
            <Save className="h-4 w-4 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
