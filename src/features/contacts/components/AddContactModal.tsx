import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/features/ui/Dialog';
import { Button } from '@/features/ui/Button';
import { Input } from '@/features/ui/Input';
import { useAppDispatch } from '@/app/hooks';
import { addContact } from '@/features/contacts/contactsSlice';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';
import { User, Phone, UserPlus } from 'lucide-react';
import { Contact } from '@/types';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  phone: z
    .string()
    .min(10, 'Enter a valid phone number (at least 10 digits)')
    .max(15, 'Phone number too long')
});

type ContactFormData = z.infer<typeof contactSchema>;

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (contact: Contact) => void;
}

export function AddContactModal({ isOpen, onClose, onCreated }: AddContactModalProps) {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phone: ''
    }
  });

  const onSubmit = (data: ContactFormData) => {
    // Clean phone number (keep digits and leading +)
    const cleanedPhone = data.phone.trim();

    const newContact: Contact = {
      id: generateId(),
      name: data.name.trim(),
      phone: cleanedPhone,
      createdAt: new Date().toISOString()
    };

    dispatch(addContact(newContact));
    toast.success(`Contact "${newContact.name}" (${newContact.phone}) added!`);
    reset();
    if (onCreated) onCreated(newContact);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Contact"
      description="Add friend's name and phone number to split expenses."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Field 1: Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Contact Name <span className="text-red-500">*</span>
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
            Logging in with this phone number will show this person's expenses and balances.
          </p>
        </div>

        <div className="pt-2 flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-1/3">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-2/3 font-semibold">
            <UserPlus className="h-4 w-4 mr-1.5" />
            Save Contact
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
