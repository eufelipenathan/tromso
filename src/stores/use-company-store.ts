"use client";

import { create } from "zustand";
import { CompanyFormData } from "@/lib/validations";
import { useCompanyContactsStore } from "./use-company-contacts-store";

interface CompanyState {
  showCompanyForm: boolean;
  isSubmitting: boolean;
  formData: Partial<CompanyFormData> & { id?: string } | null;
  setShowCompanyForm: (show: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setFormData: (data: Partial<CompanyFormData> & { id?: string }) => void;
  handleSubmit: (data: CompanyFormData) => Promise<void>;
  reset: () => void;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  showCompanyForm: false,
  isSubmitting: false,
  formData: null,

  setShowCompanyForm: (show) => {
    if (!show) {
      // Reset state when closing modal
      get().reset();
    }
    set({ showCompanyForm: show });
  },
  
  setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),
  setFormData: (data) => set({ formData: data }),

  handleSubmit: async (data) => {
    try {
      set({ isSubmitting: true });
      const currentFormData = get().formData;
      const isEditing = Boolean(currentFormData?.id);

      // Create or update company
      const response = await fetch(
        `/api/companies${isEditing ? `/${currentFormData.id}` : ''}`, 
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(isEditing ? "Erro ao atualizar empresa" : "Erro ao cadastrar empresa");
      }

      const company = await response.json();

      // Handle temporary contacts if creating new company
      if (!isEditing) {
        const temporaryContacts = useCompanyContactsStore.getState().temporaryContacts;
        if (temporaryContacts.length > 0) {
          await Promise.all(
            temporaryContacts.map((contact) =>
              fetch("/api/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...contact,
                  companyId: company.id,
                }),
              })
            )
          );
        }
      }

      set({ showCompanyForm: false });
      window.location.reload();
    } catch (error) {
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  reset: () => {
    set({ 
      showCompanyForm: false, 
      isSubmitting: false, 
      formData: null 
    });
    // Reset contacts store as well
    useCompanyContactsStore.getState().reset();
  },
}));