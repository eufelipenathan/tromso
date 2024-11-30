import { collection, doc, addDoc, updateDoc, getDocs, query, where, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Company, ContactField } from '@/types';
import { normalizeCompany } from '../utils/normalizers';
import { validateCompany } from '../utils/validators';

function generateContactId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function normalizeContactFields(fields: ContactField[]): ContactField[] {
  return fields.map(field => ({
    id: generateContactId(),
    value: field.value.trim(),
    createdAt: new Date()
  }));
}

export const companyService = {
  async getAll(): Promise<Company[]> {
    const q = query(
      collection(db, 'companies'),
      where('isDeleted', '!=', true)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      deletedAt: doc.data().deletedAt?.toDate() || null
    })) as Company[];
  },

  async create(data: Partial<Company>): Promise<{ id: string; company: Company }> {
    const normalized = normalizeCompany(data);
    const validation = validateCompany(normalized);
    
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors)[0]);
    }

    // Normalize contact fields with permanent IDs
    const phones = normalizeContactFields(normalized.phones || []);
    const emails = normalizeContactFields(normalized.emails || []);

    const companyData = {
      ...normalized,
      phones,
      emails,
      isDeleted: false,
      deletedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'companies'), companyData);
    
    return {
      id: docRef.id,
      company: {
        ...companyData,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Company
    };
  },

  async update(id: string, data: Partial<Company>): Promise<void> {
    const normalized = normalizeCompany(data);
    const validation = validateCompany(normalized);
    
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors)[0]);
    }

    // Normalize contact fields with permanent IDs if they exist
    const phones = normalized.phones ? normalizeContactFields(normalized.phones) : undefined;
    const emails = normalized.emails ? normalizeContactFields(normalized.emails) : undefined;

    const updateData = {
      ...normalized,
      phones,
      emails,
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'companies', id), updateData);
  },

  async delete(id: string): Promise<void> {
    await updateDoc(doc(db, 'companies', id), {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};