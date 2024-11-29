import { Company } from '@/types';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { collection, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useCompanyOperations() {
  const { execute } = useOptimisticUpdate<Company>();

  const createCompany = async (data: Partial<Company>, companies: Company[]) => {
    console.log('[useCompanyOperations] Creating company:', data);
    const tempId = Math.random().toString(36).substr(2, 9);
    const now = new Date();
    
    const newCompany = {
      ...data,
      id: tempId,
      createdAt: now,
      updatedAt: now
    } as Company;

    console.log('[useCompanyOperations] Created temporary company:', newCompany);
    const updatedCompanies = [...companies, newCompany];

    try {
      console.log('[useCompanyOperations] Executing create operation');
      return await execute(
        async () => {
          const docRef = await addDoc(collection(db, 'companies'), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isDeleted: false
          });

          console.log('[useCompanyOperations] Company created in Firestore:', docRef.id);
          return {
            id: docRef.id,
            entity: { ...newCompany, id: docRef.id }
          };
        },
        updatedCompanies,
        companies,
        { loadingKey: 'new-company' }
      );
    } catch (error) {
      console.error('[useCompanyOperations] Error creating company:', error);
      throw error;
    }
  };

  const updateCompany = async (id: string, data: Partial<Company>, companies: Company[]) => {
    console.log('[useCompanyOperations] Updating company:', { id, data });
    const company = companies.find(c => c.id === id);
    if (!company) {
      console.warn('[useCompanyOperations] Company not found:', id);
      return null;
    }

    const updatedCompany = {
      ...company,
      ...data,
      updatedAt: new Date()
    };

    console.log('[useCompanyOperations] Updated company data:', updatedCompany);
    const updatedCompanies = companies.map(c => c.id === id ? updatedCompany : c);

    try {
      console.log('[useCompanyOperations] Executing update operation');
      return await execute(
        async () => {
          await updateDoc(doc(db, 'companies', id), {
            ...data,
            updatedAt: serverTimestamp()
          });

          console.log('[useCompanyOperations] Company updated in Firestore');
          return {
            id,
            entity: updatedCompany
          };
        },
        updatedCompanies,
        companies,
        { loadingKey: `edit-company-${id}` }
      );
    } catch (error) {
      console.error('[useCompanyOperations] Error updating company:', error);
      throw error;
    }
  };

  return {
    createCompany,
    updateCompany
  };
}