import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/features/ui/Dialog';
import { Button } from '@/features/ui/Button';
import { Input } from '@/features/ui/Input';
import { Select } from '@/features/ui/Select';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addGroup } from '@/features/groups/groupsSlice';
import { generateId, generateInviteCode } from '@/lib/utils';
import { CurrencyCode, Group, GroupCategory } from '@/types';
import { toast } from 'sonner';
import { Plus, X, Users, Sparkles } from 'lucide-react';

const createGroupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters').max(50),
  category: z.enum(['trip', 'home', 'couple', 'party', 'office', 'other']),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED']),
  description: z.string().max(120).optional()
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (group: Group) => void;
}

export function CreateGroupModal({ isOpen, onClose, onCreated }: CreateGroupModalProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [members, setMembers] = useState<string[]>([]);
  const [memberInput, setMemberInput] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      category: 'trip',
      currency: currentUser?.defaultCurrency || 'INR',
      description: ''
    }
  });

  const handleAddMember = () => {
    const trimmed = memberInput.trim();
    if (!trimmed) return;
    if (members.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Member already added to the list');
      return;
    }
    setMembers([...members, trimmed]);
    setMemberInput('');
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const onSubmit = (data: CreateGroupFormValues) => {
    if (!currentUser) return;

    const groupMembers = [
      {
        id: currentUser.id,
        name: `${currentUser.name} (You)`,
        email: currentUser.email,
        isRegistered: true
      },
      ...members.map((name) => ({
        id: generateId(),
        name,
        isRegistered: false
      }))
    ];

    const newGroup: Group = {
      id: generateId(),
      name: data.name,
      category: data.category as GroupCategory,
      description: data.description || '',
      inviteCode: generateInviteCode(data.name),
      currency: data.currency as CurrencyCode,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memberIds: groupMembers.map((m) => m.id),
      members: groupMembers
    };

    dispatch(addGroup(newGroup));
    toast.success(`Group "${newGroup.name}" created!`);
    reset();
    setMembers([]);
    onClose();
    if (onCreated) onCreated(newGroup);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Group"
      description="Start tracking and splitting expenses with friends or flatmates."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Group Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Group Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Goa Trip, Flat 402, Birthday Dinner"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        {/* Category & Currency Grid */}
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

        {/* Description / Notes */}
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

        {/* Add Initial Members */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              Add Group Members
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              You are added automatically
            </span>
          </label>

          <div className="flex gap-2">
            <Input
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMember();
                }
              }}
              placeholder="Friend's name or email"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddMember}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          {/* Members chips list */}
          {members.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {members.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-medium"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(i)}
                    className="rounded-full p-0.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-3 flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-1/3">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-2/3">
            <Sparkles className="h-4 w-4 mr-1.5" />
            Create Group
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
