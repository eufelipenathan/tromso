import { useState, useCallback } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Company } from '@/types';
import { useCompanyOperations } from './useCompanyOperations';
import { useCompanyState } from './useCompanyState';

export function useCompanies() {
  const [isLoading, setIsLoading] = useState(true);
  const { createCompany: create, updateCompany: update } = useCompanyOperations();
  const { 
    companies, 
    setCompanies, 
    addCompany, 
    updateCompanyInState, 
    removeCompany 
  } = useCompanyState();

  console.log('[useCompanies] Initial state:', { companies });

  const loadCompanies = useCallback(async () => {
    console.log('[useCompanies] Loading companies...');
    try {
      setIsLoading(true);
      const companiesSnapshot = await getDocs(
        query(collection(db, 'companies'), where('isDeleted', '!=', true))
      );
      const companiesData = companiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Company[];

      console.log('[useCompanies] Companies loaded:', companiesData);
      setCompanies(companiesData);
    } finally {
      setIsLoading(false);
    }
  }, [setCompanies]);

  const createCompany = async (data: Partial<Company>) => {
    console.log('[useCompanies] Creating company:', data);
    if (data.id) {
      console.log('[useCompanies] Company has ID, updating instead:', data.id);
      const result = await update(data.id, data, companies);
      if (result) {
        console.log('[useCompanies] Company updated:', result);
        updateCompanyInState(result.id, result.entity);
      }
      return result;
    } else {
      console.log('[useCompanies] Creating new company');
      const result = await create(data, companies);
      if (result) {
        console.log('[useCompanies] Company created:', result);
        addCompany(result.entity);
      }
      return result;
    }
  };

  const deleteCompany = async (company: Company) => {
    console.log('[useCompanies] Deleting company:', company);
    if (!company.id) return;

    const previousCompanies = [...companies];
    removeCompany(company.id);

    try {
      await updateDoc(doc(db, 'companies', company.id), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('[useCompanies] Company deleted successfully');
    } catch (error) {
      console.error('[useCompanies] Error deleting company:', error);
      setCompanies(previousCompanies);
      throw error;
    }
  };

  return {
    companies,
    isLoading,
    loadCompanies,
    createCompany,
    deleteCompany,
    setCompanies
  };
}