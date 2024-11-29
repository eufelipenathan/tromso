import { useContactStore } from '@/stores/contactStore';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { Contact } from '@/types';

export function useContacts() {
  const {
    contacts,
    setContacts,
    addContact,
    updateContact,
    removeContact,
    getContact,
    getContactsForCompany
  } = useContactStore();

  const { execute } = useOptimisticUpdate<Contact>();

  const optimisticUpdateContact = async (
    id: string,
    updates: Partial<Contact>,
    updateFn: () => Promise<void>
  ) => {
    const contact = getContact(id);
    if (!contact) return;

    const updatedContact = { ...contact, ...updates };

    await execute(
      updateFn,
      updatedContact,
      contact,
      {
        loadingKey: `update-contact-${id}`,
        onSuccess: () => {
          updateContact(id, updates);
        }
      }
    );
  };

  return {
    contacts,
    setContacts,
    addContact,
    updateContact: optimisticUpdateContact,
    removeContact,
    getContact,
    getContactsForCompany
  };
}