import { useState, useCallback } from 'react';
import { Company } from '@/types';
import { companyService } from '@/services/companies';
import { useCompanyStore } from '@/stores/company';
import { useUI } from '@/hooks/useUI';

export function useCompanies() {
  const [isLoading, setIsLoading] = useState(true);
  const { startLoading, stopLoading } = useUI();
  const { companies, setCompanies, addCompany, updateCompany: updateCompanyInStore, removeCompany } = useCompanyStore();

  const loadCompanies = useCallback(async () => {
    console.log('[useCompanies] Loading companies');
    try {
      setIsLoading(true);
      const companiesData = await companyService.getAll();
      console.log('[useCompanies] Companies loaded:', { count: companiesData.length });
      setCompanies(companiesData);
    } catch (error) {
      console.error('[useCompanies] Error loading companies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setCompanies]);

  const createCompany = async (data: Partial<Company>) => {
    console.log('[useCompanies] Creating company:', data);
    const loadingKey = 'create-company';

    try {
      startLoading(loadingKey);
      const result = await companyService.create(data);
      console.log('[useCompanies] Company created:', result);
      addCompany(result.company);
      return result;
    } catch (error) {
      console.error('[useCompanies] Error creating company:', error);
      throw error;
    } finally {
      stopLoading(loadingKey);
    }
  };

  const updateCompany = async (id: string, data: Partial<Company>) => {
    console.log('[useCompanies] Updating company:', { id, data });
    const loadingKey = `update-company-${id}`;

    try {
      startLoading(loadingKey);
      await companyService.update(id, data);
      console.log('[useCompanies] Company updated successfully');
      updateCompanyInStore(id, data);
    } catch (error) {
      console.error('[useCompanies] Error updating company:', error);
      throw error;
    } finally {
      stopLoading(loadingKey);
    }
  };

  const deleteCompany = async (company: Company) => {
    if (!company.id) return;
    console.log('[useCompanies] Deleting company:', company);
    const loadingKey = `delete-company-${company.id}`;

    try {
      startLoading(loadingKey);
      await companyService.delete(company.id);
      console.log('[useCompanies] Company deleted successfully');
      removeCompany(company.id);
    } catch (error) {
      console.error('[useCompanies] Error deleting company:', error);
      throw error;
    } finally {
      stopLoading(loadingKey);
    }
  };

  return {
    companies,
    isLoading,
    loadCompanies,
    createCompany,
    updateCompany,
    deleteCompany
  };
}