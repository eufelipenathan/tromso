import { useState, useCallback } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Company } from '@/types';
import { useCompanyOperations } from '@/features/companies/hooks/useCompanyOperations';
import { useCompanyState } from '@/features/companies/hooks/useCompanyState';

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

  const loadCompanies = useCallback(async () => {
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
      setCompanies(companiesData);
    } finally {
      setIsLoading(false);
    }
  }, [setCompanies]);

  const createCompany = async (data: Partial<Company>) => {
    if (data.id) {
      const result = await update(data.id, data, companies);
      if (result) {
        updateCompanyInState(result.id, result.entity);
      }
      return result;
    } else {
      const result = await create(data, companies);
      if (result) {
        addCompany(result.entity);
      }
      return result;
    }
  };

  const deleteCompany = async (company: Company) => {
    if (!company.id) return;

    const previousCompanies = [...companies];
    removeCompany(company.id);

    try {
      await updateDoc(doc(db, 'companies', company.id), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
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