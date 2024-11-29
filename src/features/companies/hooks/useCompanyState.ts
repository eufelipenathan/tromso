import { useState, useCallback } from 'react';
import { Company } from '@/types';

export function useCompanyState() {
  const [companies, setCompanies] = useState<Company[]>([]);

  console.log('[useCompanyState] Current companies:', companies);

  const addCompany = useCallback((company: Company) => {
    console.log('[useCompanyState] Adding company:', company);
    setCompanies(prev => {
      const newCompanies = [...prev, company];
      console.log('[useCompanyState] Updated companies after add:', newCompanies);
      return newCompanies;
    });
  }, []);

  const updateCompanyInState = useCallback((id: string, updates: Partial<Company>) => {
    console.log('[useCompanyState] Updating company:', { id, updates });
    setCompanies(prev => {
      const newCompanies = prev.map(company => 
        company.id === id ? { ...company, ...updates } : company
      );
      console.log('[useCompanyState] Updated companies after update:', newCompanies);
      return newCompanies;
    });
  }, []);

  const removeCompany = useCallback((id: string) => {
    console.log('[useCompanyState] Removing company:', id);
    setCompanies(prev => {
      const newCompanies = prev.filter(company => company.id !== id);
      console.log('[useCompanyState] Updated companies after remove:', newCompanies);
      return newCompanies;
    });
  }, []);

  return {
    companies,
    setCompanies,
    addCompany,
    updateCompanyInState,
    removeCompany
  };
}