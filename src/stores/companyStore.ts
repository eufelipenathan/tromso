import { create } from 'zustand';
import { Company } from '@/types';

interface CompanyState {
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
  addCompany: (company: Company) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;
  removeCompany: (id: string) => void;
  getCompany: (id: string) => Company | undefined;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],

  setCompanies: (companies) => set({ companies }),

  addCompany: (company) => set((state) => ({
    companies: [...state.companies, company]
  })),

  updateCompany: (id, updates) => set((state) => ({
    companies: state.companies.map((company) =>
      company.id === id ? { ...company, ...updates } : company
    )
  })),

  removeCompany: (id) => set((state) => ({
    companies: state.companies.filter((company) => company.id !== id)
  })),

  getCompany: (id) => get().companies.find((company) => company.id === id)
}));