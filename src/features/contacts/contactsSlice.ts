import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Contact } from '@/types';
import { SEED_CONTACTS } from '@/lib/seedData';

interface ContactsState {
  contacts: Contact[];
}

const STORAGE_KEY = 'splitwise_contacts';

const loadInitialContacts = (): Contact[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load contacts from storage', e);
  }
  return SEED_CONTACTS;
};

const initialState: ContactsState = {
  contacts: loadInitialContacts()
};

export const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<Contact[]>) => {
      state.contacts = action.payload;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
    },
    addContact: (state, action: PayloadAction<Contact>) => {
      // Avoid duplicate by phone number
      const existing = state.contacts.findIndex(
        (c) => c.phone.replace(/\D/g, '') === action.payload.phone.replace(/\D/g, '')
      );
      if (existing !== -1) {
        state.contacts[existing] = action.payload;
      } else {
        state.contacts.unshift(action.payload);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.contacts));
    },
    deleteContact: (state, action: PayloadAction<string>) => {
      state.contacts = state.contacts.filter((c) => c.id !== action.payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.contacts));
    }
  }
});

export const { setContacts, addContact, deleteContact } = contactsSlice.actions;

export default contactsSlice.reducer;
