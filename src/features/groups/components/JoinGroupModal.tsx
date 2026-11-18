import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/features/ui/Dialog';
import { Button } from '@/features/ui/Button';
import { Input } from '@/features/ui/Input';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addMemberToGroup } from '@/features/groups/groupsSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { QrCode, LogIn } from 'lucide-react';

const joinGroupSchema = z.object({
  inviteCode: z
    .string()
    .min(4, 'Enter a valid invite code')
    .transform((val) => val.trim().toUpperCase())
});

type JoinGroupFormValues = z.infer<typeof joinGroupSchema>;

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinGroupModal({ isOpen, onClose }: JoinGroupModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const groups = useAppSelector((state) => state.groups.groups);
  const currentUser = useAppSelector((state) => state.auth.user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<JoinGroupFormValues>({
    resolver: zodResolver(joinGroupSchema),
    defaultValues: { inviteCode: '' }
  });

  const onSubmit = (data: JoinGroupFormValues) => {
    if (!currentUser) return;

    const code = data.inviteCode;
    const foundGroup = groups.find(
      (g) => g.inviteCode.toUpperCase() === code
    );

    if (!foundGroup) {
      toast.error('No group found with this invite code. Check the code and try again.');
      return;
    }

    const alreadyMember = foundGroup.memberIds.includes(currentUser.id);
    if (!alreadyMember) {
      dispatch(
        addMemberToGroup({
          groupId: foundGroup.id,
          member: {
            id: currentUser.id,
            name: `${currentUser.name} (You)`,
            email: currentUser.email,
            isRegistered: true
          }
        })
      );
      toast.success(`Joined "${foundGroup.name}"!`);
    } else {
      toast.info(`You are already a member of "${foundGroup.name}".`);
    }

    reset();
    onClose();
    navigate(`/group/${foundGroup.id}`);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Join Group with Code"
      description="Enter the unique code shared by a group member."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Group Invite Code
          </label>
          <Input
            placeholder="e.g. GOA-4821 or FLT-9104"
            className="uppercase font-mono text-center tracking-widest text-base font-bold"
            leftIcon={<QrCode className="h-5 w-5" />}
            error={errors.inviteCode?.message}
            {...register('inviteCode')}
          />
        </div>

        <div className="rounded-xl bg-blue-50/70 p-3 text-xs text-blue-800 space-y-1">
          <p className="font-semibold">💡 Quick Tip:</p>
          <p className="text-blue-700">
            You can find the invite code at the top of any group screen or ask the group creator to share their invite link.
          </p>
        </div>

        <div className="pt-2 flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-1/3">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-2/3">
            <LogIn className="h-4 w-4 mr-1.5" />
            Join Group
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
