import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/features/ui/Dialog';
import { Button } from '@/features/ui/Button';
import { Input } from '@/features/ui/Input';
import { Group } from '@/types';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addMemberToGroup } from '@/features/groups/groupsSlice';
import { saveGroupToFirestore } from '@/features/api/firestoreService';
import { addContact } from '@/features/contacts/contactsSlice';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';
import { UserPlus, User, Phone, BookUser } from 'lucide-react';

const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .min(10, 'Enter a valid phone number (at least 10 digits)')
    .max(15, 'Phone number too long')
});

type MemberFormData = z.infer<typeof memberSchema>;

interface AddMemberModalProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberModal({ group, isOpen, onClose }: AddMemberModalProps) {
  const dispatch = useAppDispatch();
  const contacts = useAppSelector((state) => state.contacts.contacts);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: { name: '', phone: '' }
  });

  // Pick from existing contacts
  const handleSelectContact = (name: string, phone: string) => {
    setValue('name', name);
    setValue('phone', phone);
  };

  const onSubmit = (data: MemberFormData) => {
    const cleanedPhone = data.phone.trim();
    const cleanedName = data.name.trim();

    // Check duplicate by name or phone
    const exists = group.members.some(
      (m) =>
        m.name.toLowerCase() === cleanedName.toLowerCase() ||
        (m.phone && m.phone.replace(/\D/g, '') === cleanedPhone.replace(/\D/g, ''))
    );

    if (exists) {
      toast.error('This member or phone number is already in the group.');
      return;
    }

    const newMember = {
      id: generateId(),
      name: cleanedName,
      phone: cleanedPhone,
      isRegistered: false
    };

    dispatch(
      addMemberToGroup({
        groupId: group.id,
        member: newMember
      })
    );

    // Also automatically add to contacts for future quick-use!
    dispatch(
      addContact({
        id: generateId(),
        name: cleanedName,
        phone: cleanedPhone,
        createdAt: new Date().toISOString()
      })
    );

    const updatedGroup: Group = {
      ...group,
      memberIds: [...group.memberIds, newMember.id],
      members: [...group.members, newMember],
      updatedAt: new Date().toISOString()
    };
    saveGroupToFirestore(updatedGroup).catch((err) =>
      console.warn('Updated group locally; Firestore sync pending:', err)
    );

    toast.success(`Added ${newMember.name} (${newMember.phone}) to ${group.name}!`);
    reset();
    onClose();
  };

  // Contacts not yet in this group
  const availableContacts = contacts.filter(
    (c) =>
      !group.members.some(
        (m) =>
          m.phone && m.phone.replace(/\D/g, '') === c.phone.replace(/\D/g, '')
      )
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add Group Member"
      description={`Add contact with name and phone number to "${group.name}".`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Quick Pick From Saved Contacts */}
        {availableContacts.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <BookUser className="h-3.5 w-3.5 text-blue-600" />
              Quick pick from contacts:
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {availableContacts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectContact(c.name, c.phone)}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200/60 shrink-0 transition-colors"
                >
                  {c.name} ({c.phone.slice(-4)})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Field 1: Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Member Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Priya Sharma"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        {/* Field 2: Phone Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <Input
            type="tel"
            placeholder="e.g. 9876543210"
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
            {...register('phone')}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            When this person logs in with this phone number, they will see this group and their expenses.
          </p>
        </div>

        <div className="pt-2 flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-1/3">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-2/3 font-semibold">
            <UserPlus className="h-4 w-4 mr-1.5" />
            Add to Group
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
