import { useState, useCallback } from 'react';
import { Company } from '@/types';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { companyService } from '../services/companyService';
import { useUI } from '@/hooks/useUI';

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { execute } = useOptimisticUpdate<Company>();
  const { startLoading, stopLoading } = useUI();

  const loadCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      const companiesData = await companyService.getAll();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCompany = async (data: Partial<Company>) => {
    const previousCompanies = [...companies];
    const tempId = Math.random().toString(36).substr(2, 9);
    const now = new Date();
    
    const newCompany = {
      ...data,
      id: tempId,
      createdAt: now,
      updatedAt: now
    } as Company;

    // Optimistic update
    setCompanies(prev => [...prev, newCompany]);

    try {
      const result = await execute(
        async () => {
          const result = await companyService.create(data);
          if (result) {
            // Update local state with real ID
            setCompanies(prev => prev.map(c => 
              c.id === tempId ? result.company : c
            ));
          }
          return result;
        },
        [...companies, newCompany],
        previousCompanies,
        { loadingKey: 'new-company' }
      );

      return result;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  };

  const updateCompany = async (id: string, data: Partial<Company>) => {
    const previousCompanies = [...companies];
    const updatedCompany = {
      ...companies.find(c => c.id === id),
      ...data,
      updatedAt: new Date()
    } as Company;

    // Optimistic update
    setCompanies(prev => prev.map(c => c.id === id ? updatedCompany : c));

    try {
      await execute(
        async () => {
          await companyService.update(id, data);
        },
        companies.map(c => c.id === id ? updatedCompany : c),
        previousCompanies,
        { loadingKey: `edit-company-${id}` }
      );
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  };

  const deleteCompany = async (company: Company) => {
    if (!company.id) return;

    const previousCompanies = [...companies];
    setCompanies(prev => prev.filter(c => c.id !== company.id));

    try {
      await execute(
        async () => {
          await companyService.delete(company.id!);
        },
        companies.filter(c => c.id !== company.id),
        previousCompanies,
        { loadingKey: `delete-company-${company.id}` }
      );
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
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