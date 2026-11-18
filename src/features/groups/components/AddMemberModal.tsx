import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/features/ui/Dialog';
import { Button } from '@/features/ui/Button';
import { Input } from '@/features/ui/Input';
import { Group } from '@/types';
import { useAppDispatch } from '@/app/hooks';
import { addMemberToGroup } from '@/features/groups/groupsSlice';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email').optional().or(z.literal(''))
});

type MemberFormData = z.infer<typeof memberSchema>;

interface AddMemberModalProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberModal({ group, isOpen, onClose }: AddMemberModalProps) {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: { name: '', email: '' }
  });

  const onSubmit = (data: MemberFormData) => {
    const exists = group.members.some(
      (m) => m.name.toLowerCase() === data.name.trim().toLowerCase()
    );

    if (exists) {
      toast.error('A member with this name already exists in this group.');
      return;
    }

    const newMember = {
      id: generateId(),
      name: data.name.trim(),
      email: data.email || undefined,
      isRegistered: false
    };

    dispatch(
      addMemberToGroup({
        groupId: group.id,
        member: newMember
      })
    );

    toast.success(`Added ${newMember.name} to ${group.name}!`);
    reset();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add Group Member"
      description={`Add another person to "${group.name}".`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Member Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Sarah Jenkins"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <Input
            type="email"
            placeholder="sarah@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="pt-2 flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-1/3">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-2/3">
            <UserPlus className="h-4 w-4 mr-1.5" />
            Add to Group
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
