import { useState } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Company } from '@/types';
import { formatWebsite } from '@/utils/validators';

export function useCompanyCreation() {
  const [error, setError] = useState<string | null>(null);

  const saveCompany = async (data: Partial<Company>): Promise<{ id: string; company: Company } | null> => {
    try {
      setError(null);

      // Clean and validate data
      const cleanWebsite = data.website?.trim();
      const formattedWebsite = cleanWebsite ? formatWebsite(cleanWebsite) : null;

      // Generate search tokens
      const name = data.name?.toLowerCase().trim() || '';
      const words = name.split(' ').filter(word => word.length > 0);
      const searchTokens = new Set<string>();

      // Add individual words
      words.forEach(word => searchTokens.add(word));

      // Add word combinations (up to 3 words)
      for (let size = 2; size <= Math.min(3, words.length); size++) {
        for (let i = 0; i <= words.length - size; i++) {
          const combination = words.slice(i, i + size).join(' ');
          if (combination.length <= 1500) {
            searchTokens.add(combination);
          }
        }
      }

      // Add full name if within limit
      if (name.length <= 1500) {
        searchTokens.add(name);
      }

      // Prepare company data
      const companyData = {
        name: data.name?.trim() || '',
        legalName: data.legalName?.trim() || '',
        cnpj: data.cnpj || '',
        phones: data.phones || [],
        emails: data.emails || [],
        website: formattedWebsite,
        address: {
          cep: data.address?.cep || '',
          street: data.address?.street || '',
          number: data.address?.number || '',
          complement: data.address?.complement || '',
          district: data.address?.district || '',
          postalBox: data.address?.postalBox || '',
          state: data.address?.state || '',
          city: data.address?.city || '',
        },
        customFields: data.customFields || {},
        searchTokens: Array.from(searchTokens),
        updatedAt: serverTimestamp()
      };

      let id: string;
      let company: Company;

      // If we have an ID, update existing company
      if (data.id) {
        await updateDoc(doc(db, 'companies', data.id), companyData);
        id = data.id;
        company = { ...companyData, id } as Company;
      } else {
        // Otherwise create new company
        const docRef = await addDoc(collection(db, 'companies'), {
          ...companyData,
          createdAt: serverTimestamp()
        });
        id = docRef.id;
        company = { ...companyData, id, createdAt: new Date() } as Company;
      }
      
      return { id, company };
    } catch (error) {
      setError('Erro ao salvar empresa. Por favor, tente novamente.');
      return null;
    }
  };

  return {
    saveCompany,
    error
  };
}