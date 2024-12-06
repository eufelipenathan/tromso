'use client';

import type { ContactFormData } from '@/lib/validations';
import { create } from 'zustand';

interface ContactState {
  showContactForm: boolean;
  isSubmitting: boolean;
  formData:
    | (Partial<ContactFormData> & {
        id?: string;
        company?: {
          id: string;
          name: string;
        };
      })
    | null;
  setShowContactForm: (show: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setFormData: (
    data: Partial<ContactFormData> & {
      id?: string;
      company?: {
        id: string;
        name: string;
      };
    },
  ) => void;
  handleSubmit: (data: ContactFormData) => Promise<void>;
  reset: () => void;
}

export const useContactStore = create<ContactState>((set, get) => ({
  showContactForm: false,
  isSubmitting: false,
  formData: null,

  setShowContactForm: (show) => {
    if (!show) {
      get().reset();
    }
    set({ showContactForm: show });
  },

  setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),
  setFormData: (data) => set({ formData: data }),

  handleSubmit: async (data) => {
    try {
      set({ isSubmitting: true });
      const currentFormData = get().formData;
      const isEditing = Boolean(currentFormData?.id);

      const response = await fetch(
        `/api/contacts${isEditing && currentFormData?.id ? `/${currentFormData.id}` : ''}`,
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error(
          isEditing ? 'Erro ao atualizar contato' : 'Erro ao cadastrar contato',
        );
      }

      set({ showContactForm: false });
      window.location.reload();
    } catch (error) {
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  reset: () => {
    set({
      showContactForm: false,
      isSubmitting: false,
      formData: null,
    });
  },
}));
