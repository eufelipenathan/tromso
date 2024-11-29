import { collection, doc, addDoc, updateDoc, getDocs, query, where, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Company } from '@/types';
import { normalizeCompany } from './normalizers';
import { validateCompany } from './validators';

// Lista de campos que não devem ser atualizados
const PROTECTED_FIELDS = ['createdAt', 'id'];

export const companyService = {
  async create(data: Partial<Company>): Promise<{ id: string; company: Company }> {
    console.log('[CompanyService] Creating company:', { data });
    
    const normalized = normalizeCompany(data);
    console.log('[CompanyService] Normalized company data:', { normalized });

    const validation = validateCompany(normalized);
    console.log('[CompanyService] Validation result:', { validation });
    
    if (!validation.isValid) {
      console.error('[CompanyService] Validation failed:', validation.errors);
      throw new Error(validation.errors.join(', '));
    }

    // Remove undefined fields
    const companyData = Object.entries(normalized).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    console.log('[CompanyService] Cleaned company data:', { companyData });

    const docData = {
      ...companyData,
      isDeleted: false,
      deletedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('[CompanyService] Final document data:', { docData });

    const docRef = await addDoc(collection(db, 'companies'), docData);
    console.log('[CompanyService] Company created with ID:', docRef.id);

    // Fetch the created document to get server timestamps
    const createdDoc = await getDoc(docRef);
    const createdData = createdDoc.data();
    console.log('[CompanyService] Created document data:', { createdData });

    const result = {
      id: docRef.id,
      company: {
        ...companyData,
        id: docRef.id,
        isDeleted: false,
        deletedAt: null,
        createdAt: createdData?.createdAt?.toDate() || new Date(),
        updatedAt: createdData?.updatedAt?.toDate() || new Date()
      } as Company
    };

    console.log('[CompanyService] Returning created company:', result);
    return result;
  },

  async update(id: string, data: Partial<Company>): Promise<Company> {
    console.log('[CompanyService] Updating company:', { id, data });
    
    const normalized = normalizeCompany(data);
    console.log('[CompanyService] Normalized update data:', { normalized });
    
    const validation = validateCompany(normalized);
    console.log('[CompanyService] Validation result:', { validation });
    
    if (!validation.isValid) {
      console.error('[CompanyService] Validation failed:', validation.errors);
      throw new Error(validation.errors.join(', '));
    }

    // Remove campos protegidos e undefined
    const updateData = Object.entries(normalized).reduce((acc, [key, value]) => {
      if (!PROTECTED_FIELDS.includes(key) && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    console.log('[CompanyService] Cleaned update data:', { updateData });

    const docData = {
      ...updateData,
      updatedAt: serverTimestamp()
    };

    console.log('[CompanyService] Final update document:', { docData });

    const docRef = doc(db, 'companies', id);
    await updateDoc(docRef, docData);
    console.log('[CompanyService] Company updated successfully:', id);

    // Fetch the updated document to get the latest data with server timestamps
    const updatedDoc = await getDoc(docRef);
    const updatedData = updatedDoc.data();
    console.log('[CompanyService] Updated document data:', { updatedData });

    const updatedCompany = {
      ...updatedData,
      id,
      createdAt: updatedData?.createdAt?.toDate() || new Date(),
      updatedAt: updatedData?.updatedAt?.toDate() || new Date(),
      deletedAt: updatedData?.deletedAt?.toDate() || null
    } as Company;

    console.log('[CompanyService] Returning updated company:', updatedCompany);
    return updatedCompany;
  },

  async delete(id: string): Promise<void> {
    console.log('[CompanyService] Soft deleting company:', id);
    
    const updateData = {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'companies', id), updateData);
    console.log('[CompanyService] Company soft deleted successfully:', id);
  },

  async getAll(): Promise<Company[]> {
    console.log('[CompanyService] Getting all non-deleted companies');
    
    const q = query(
      collection(db, 'companies'),
      where('isDeleted', '!=', true)
    );
    
    const snapshot = await getDocs(q);
    const companies = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      deletedAt: doc.data().deletedAt?.toDate() || null
    })) as Company[];

    console.log('[CompanyService] Retrieved companies:', { count: companies.length });
    return companies;
  }
};