import { create } from "zustand";
import { CompanyFormData } from "@/lib/validations";

interface CompanyState {
  showCompanyForm: boolean;
  isSubmitting: boolean;
  setShowCompanyForm: (show: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  handleSubmit: (data: CompanyFormData) => Promise<void>;
  reset: () => void;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  showCompanyForm: false,
  isSubmitting: false,

  setShowCompanyForm: (show) => set({ showCompanyForm: show }),
  setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),

  handleSubmit: async (data) => {
    try {
      set({ isSubmitting: true });

      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar empresa");
      }

      const company = await response.json();

      // Criar contatos permanentes
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

      set({ showCompanyForm: false });
      window.location.reload();
    } catch (error) {
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  reset: () => set({ showCompanyForm: false, isSubmitting: false }),
}));