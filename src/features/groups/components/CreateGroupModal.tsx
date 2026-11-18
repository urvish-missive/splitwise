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
import { addContact } from '@/features/contacts/contactsSlice';
import { saveGroupToFirestore } from '@/features/api/firestoreService';
import { generateId, generateInviteCode, isSamePhone, normalizePhone } from '@/lib/utils';
import { CurrencyCode, Group, GroupCategory } from '@/types';
import { toast } from 'sonner';
import { Plus, X, Users, Sparkles, User, Phone, BookUser } from 'lucide-react';

const createGroupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters').max(50),
  category: z.enum(['trip', 'home', 'couple', 'party', 'office', 'other']),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED']),
  description: z.string().max(120).optional()
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

interface DraftMember {
  id?: string;
  name: string;
  phone?: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (group: Group) => void;
}

export function CreateGroupModal({ isOpen, onClose, onCreated }: CreateGroupModalProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const contacts = useAppSelector((state) => state.contacts.contacts);

  const [members, setMembers] = useState<DraftMember[]>([]);
  const [memberNameInput, setMemberNameInput] = useState('');
  const [memberPhoneInput, setMemberPhoneInput] = useState('');

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
    const trimmedName = memberNameInput.trim();
    const trimmedPhone = memberPhoneInput.trim();

    if (!trimmedName) {
      toast.error('Please enter a name for the member');
      return;
    }

    if (
      members.some(
        (m) =>
          m.name.toLowerCase() === trimmedName.toLowerCase() ||
          (trimmedPhone && m.phone && isSamePhone(m.phone, trimmedPhone))
      )
    ) {
      toast.error('This member or phone number is already added');
      return;
    }

    // Look up in contacts
    const existingContact = contacts.find(
      (c) =>
        c.name.toLowerCase() === trimmedName.toLowerCase() ||
        (trimmedPhone && isSamePhone(c.phone, trimmedPhone))
    );

    const newDraft: DraftMember = {
      id: existingContact?.id,
      name: trimmedName,
      phone: trimmedPhone || existingContact?.phone
    };

    setMembers([...members, newDraft]);
    setMemberNameInput('');
    setMemberPhoneInput('');
  };

  const handleAddFromContacts = (contact: { id: string; name: string; phone: string }) => {
    if (
      members.some(
        (m) =>
          m.name.toLowerCase() === contact.name.toLowerCase() ||
          isSamePhone(m.phone, contact.phone)
      )
    ) {
      toast.info(`${contact.name} is already added`);
      return;
    }

    setMembers([...members, { id: contact.id, name: contact.name, phone: contact.phone }]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const onSubmit = (data: CreateGroupFormValues) => {
    if (!currentUser) return;

    // Build members list with phone numbers
    const groupMembers = [
      {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        isRegistered: true
      },
      ...members.map((m) => {
        const id = m.id || generateId();
        // If they provided a phone number, auto-save to contacts for future convenience
        if (m.phone) {
          const alreadyInContacts = contacts.some((c) => isSamePhone(c.phone, m.phone));
          if (!alreadyInContacts) {
            dispatch(
              addContact({
                id,
                name: m.name,
                phone: m.phone,
                createdAt: new Date().toISOString()
              })
            );
          }
        }
        return {
          id,
          name: m.name,
          phone: m.phone,
          isRegistered: false
        };
      })
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
    saveGroupToFirestore(newGroup).catch((err) =>
      console.warn('Saved group locally; Firestore sync pending:', err)
    );
    toast.success(`Group "${newGroup.name}" created!`);
    reset();
    setMembers([]);
    setMemberNameInput('');
    setMemberPhoneInput('');
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
            placeholder="e.g. Goa Trip, Flat 402, Friday Dinner"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        {/* Category & Currency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <Select
              label="Category"
              options={[
                { value: 'trip', label: 'Trip & Travel' },
                { value: 'home', label: 'Flat & Home' },
                { value: 'couple', label: 'Couple' },
                { value: 'party', label: 'Party & Outing' },
                { value: 'office', label: 'Office & Work' },
                { value: 'other', label: 'Other' }
              ]}
              {...register('category')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Currency
            </label>
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

        {/* Add Initial Members (Two Fields: Name + Phone, or 1-tap Contact Picker) */}
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

          {/* Quick Contacts Picker Chips */}
          {contacts.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <BookUser className="h-3 w-3 text-blue-500" />
                Quick pick from contacts:
              </p>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                {contacts.map((c) => {
                  const alreadyAdded = members.some((m) => isSamePhone(m.phone, c.phone));
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddFromContacts(c)}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-all ${
                        alreadyAdded
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <Plus className="h-2.5 w-2.5" />
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Two fields: Name & Phone */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={memberNameInput}
                onChange={(e) => setMemberNameInput(e.target.value)}
                placeholder="Name (e.g. Priya)"
                leftIcon={<User className="h-3.5 w-3.5" />}
              />
              <Input
                type="tel"
                value={memberPhoneInput}
                onChange={(e) => setMemberPhoneInput(e.target.value)}
                placeholder="Phone (e.g. 9876543211)"
                leftIcon={<Phone className="h-3.5 w-3.5" />}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddMember}
              className="w-full h-8 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Member to Group
            </Button>
          </div>

          {/* Members chips list */}
          {members.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {members.map((m, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-800 px-2.5 py-1 text-xs font-medium border border-slate-200/80"
                >
                  <span className="font-semibold">{m.name}</span>
                  {m.phone && <span className="text-[10px] text-slate-500">({m.phone})</span>}
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
