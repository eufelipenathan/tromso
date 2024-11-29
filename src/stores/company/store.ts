import { create } from 'zustand';
import { CompanyState } from './types';

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],

  setCompanies: (companies) => {
    console.log('[CompanyStore] Setting companies:', { count: companies.length });
    set({ companies });
  },

  addCompany: (company) => {
    console.log('[CompanyStore] Adding company:', company);
    set((state) => {
      const newCompanies = [...state.companies, company];
      console.log('[CompanyStore] Updated companies:', { count: newCompanies.length });
      return { companies: newCompanies };
    });
  },

  updateCompany: (id, updates) => {
    console.log('[CompanyStore] Updating company:', { id, updates });
    set((state) => {
      const newCompanies = state.companies.map((company) =>
        company.id === id ? { ...company, ...updates } : company
      );
      console.log('[CompanyStore] Updated companies:', { count: newCompanies.length });
      return { companies: newCompanies };
    });
  },

  removeCompany: (id) => {
    console.log('[CompanyStore] Removing company:', id);
    set((state) => {
      const newCompanies = state.companies.filter((company) => company.id !== id);
      console.log('[CompanyStore] Updated companies:', { count: newCompanies.length });
      return { companies: newCompanies };
    });
  },

  getCompany: (id) => {
    const company = get().companies.find((company) => company.id === id);
    console.log('[CompanyStore] Getting company:', { id, found: !!company });
    return company;
  }
}));