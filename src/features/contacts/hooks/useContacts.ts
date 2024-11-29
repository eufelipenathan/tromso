import { useState } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Contact } from '@/types';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { useEntityCreation, useEntitySelection, contactConfig } from '@/lib/entity-management';
import { normalizeDate } from '@/utils/dates';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { execute } = useOptimisticUpdate<Contact>();
  const { createEntity } = useEntityCreation<Contact>(contactConfig);
  const { handleEntityCreated } = useEntitySelection<Contact>();

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const contactsSnapshot = await getDocs(
        query(collection(db, 'contacts'), where('isDeleted', '!=', true))
      );
      const contactsData = contactsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: normalizeDate(data.createdAt) || new Date(),
          updatedAt: normalizeDate(data.updatedAt) || new Date()
        } as Contact;
      });
      setContacts(contactsData);
    } finally {
      setIsLoading(false);
    }
  };

  const createContact = async (data: Partial<Contact>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const now = new Date();
    const newContact = {
      ...data,
      id: tempId,
      createdAt: now,
      updatedAt: now,
      isDeleted: false
    } as Contact;

    // Optimistic update
    setContacts(prev => [...prev, newContact]);

    try {
      const result = await execute(
        async () => {
          const result = await createEntity(data);
          if (result) {
            await handleEntityCreated(result.id, result.entity);
            // Update local state with real ID and server timestamps
            setContacts(prev => prev.map(c => 
              c.id === tempId ? {
                ...result.entity,
                createdAt: now,
                updatedAt: now
              } : c
            ));
          }
          return result;
        },
        [...contacts, newContact],
        contacts,
        { loadingKey: 'new-contact' }
      );

      if (!result) {
        throw new Error('Failed to create contact');
      }

      return result;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  };

  const deleteContact = async (contact: Contact) => {
    // Optimistic update
    setContacts(prev => prev.filter(c => c.id !== contact.id));

    try {
      await execute(
        async () => {
          await updateDoc(doc(db, 'contacts', contact.id!), {
            isDeleted: true,
            deletedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        },
        contacts.filter(c => c.id !== contact.id),
        contacts,
        { loadingKey: `delete-contact-${contact.id}` }
      );
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  };

  return {
    contacts,
    isLoading,
    loadContacts,
    createContact,
    deleteContact,
    setContacts
  };
}