import { create } from 'zustand';
import { Contact } from '@/types';

interface ContactState {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  removeContact: (id: string) => void;
  getContact: (id: string) => Contact | undefined;
  getContactsForCompany: (companyId: string) => Contact[];
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],

  setContacts: (contacts) => set({ contacts }),

  addContact: (contact) => set((state) => ({
    contacts: [...state.contacts, contact]
  })),

  updateContact: (id, updates) => set((state) => ({
    contacts: state.contacts.map((contact) =>
      contact.id === id ? { ...contact, ...updates } : contact
    )
  })),

  removeContact: (id) => set((state) => ({
    contacts: state.contacts.filter((contact) => contact.id !== id)
  })),

  getContact: (id) => get().contacts.find((contact) => contact.id === id),

  getContactsForCompany: (companyId) => 
    get().contacts.filter((contact) => contact.companyId === companyId)
}));