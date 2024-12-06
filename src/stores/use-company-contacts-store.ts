"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { Contact } from "@prisma/client";
import { ContactFormData } from "@/lib/validations";

interface ContactState {
  temporaryContacts: Contact[];
  selectedContacts: Contact[];
  showContactForm: boolean;
  searchTerm: string;
  searchResults: Contact[];
  selectedContact: Contact | null;
  showDeleteDialog: boolean;
  isLoading: boolean;
  addTemporaryContact: (data: ContactFormData) => void;
  removeTemporaryContact: (id: string) => void;
  updateTemporaryContact: (id: string, data: ContactFormData) => void;
  addSelectedContact: (contact: Contact) => void;
  removeSelectedContact: (id: string) => void;
  setShowContactForm: (show: boolean) => void;
  setSearchTerm: (term: string) => void;
  setSearchResults: (results: Contact[]) => void;
  setSelectedContact: (contact: Contact | null) => void;
  setShowDeleteDialog: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useCompanyContactsStore = create<ContactState>((set) => ({
  temporaryContacts: [],
  selectedContacts: [],
  showContactForm: false,
  searchTerm: "",
  searchResults: [],
  selectedContact: null,
  showDeleteDialog: false,
  isLoading: false,

  addTemporaryContact: (data) =>
    set((state) => ({
      temporaryContacts: [
        ...state.temporaryContacts,
        {
          ...data,
          id: `temp_${uuidv4()}`,
          companyId: "",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        } as Contact,
      ],
    })),

  removeTemporaryContact: (id) =>
    set((state) => ({
      temporaryContacts: state.temporaryContacts.filter(
        (contact) => contact.id !== id
      ),
    })),

  updateTemporaryContact: (id, data) =>
    set((state) => ({
      temporaryContacts: state.temporaryContacts.map((contact) =>
        contact.id === id
          ? {
              ...contact,
              ...data,
              updatedAt: new Date(),
            }
          : contact
      ),
    })),

  addSelectedContact: (contact) =>
    set((state) => ({
      selectedContacts: [...state.selectedContacts, contact],
    })),

  removeSelectedContact: (id) =>
    set((state) => ({
      selectedContacts: state.selectedContacts.filter(
        (contact) => contact.id !== id
      ),
    })),

  setShowContactForm: (show) => set({ showContactForm: show }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSearchResults: (results) => set({ searchResults: results }),
  setSelectedContact: (contact) => set({ selectedContact: contact }),
  setShowDeleteDialog: (show) => set({ showDeleteDialog: show }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  reset: () =>
    set({
      temporaryContacts: [],
      selectedContacts: [],
      showContactForm: false,
      searchTerm: "",
      searchResults: [],
      selectedContact: null,
      showDeleteDialog: false,
      isLoading: false,
    }),
}));