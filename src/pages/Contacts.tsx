import React, { useState, useEffect } from 'react';
import { Contact, Company } from '@/types';
import { useContacts } from '@/features/contacts/hooks/useContacts';
import { useCompanies } from '@/hooks/useCompanies';
import { useGridPreferences } from '@/hooks/useGridPreferences';
import { ContactForm } from '@/features/contacts/components/ContactForm';
import { ContactList } from '@/features/contacts/components/ContactList';
import Modal from '@/components/Modal';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import LoadingState from '@/components/LoadingState';

function Contacts() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const { contacts, isLoading, loadContacts, createContact, deleteContact } = useContacts();
  const { companies, loadCompanies } = useCompanies();
  const { preferences, loading: preferencesLoading, savePreferences } = useGridPreferences('contacts');

  useEffect(() => {
    loadContacts();
    loadCompanies();
  }, []);

  const handleSubmit = async (data: Partial<Contact>) => {
    // Close modal immediately
    setIsModalOpen(false);
    setCurrentContact(null);

    try {
      await createContact(data);
    } catch (error) {
      // If there's an error, we don't need to reopen the modal
      // since we're using optimistic updates
      console.error('Error saving contact:', error);
    }
  };

  const handleDelete = async (contact: Contact) => {
    if (!window.confirm('Tem certeza que deseja excluir este contato?')) {
      return;
    }

    try {
      await deleteContact(contact);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleCompanyCreated = async (companyId: string, company: Company) => {
    // Close modal immediately
    setIsCompanyModalOpen(false);
    setNewCompanyName('');

    try {
      await loadCompanies();
      return company;
    } catch (error) {
      console.error('Error refreshing companies:', error);
      return company;
    }
  };

  if (isLoading || preferencesLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <LoadingState container className="h-32" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Contatos">
        <Button
          onClick={() => {
            setCurrentContact(null);
            setIsModalOpen(true);
          }}
          size="lg"
          loadingKey="new-contact"
        >
          Novo Contato
        </Button>
      </PageHeader>

      <div className="mt-8">
        <ContactList
          contacts={contacts}
          companies={companies}
          preferences={preferences}
          onPreferencesChange={savePreferences}
          onEdit={(contact) => {
            setCurrentContact(contact);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentContact(null);
        }}
        title={currentContact ? 'Editar Contato' : 'Novo Contato'}
      >
        <ContactForm
          contact={currentContact || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setCurrentContact(null);
          }}
          onCompanyCreate={(name) => {
            setNewCompanyName(name);
            setIsCompanyModalOpen(true);
          }}
          companies={companies}
          isEditing={!!currentContact}
        />
      </Modal>

      <CompanyForm
        isOpen={isCompanyModalOpen}
        onClose={() => {
          setIsCompanyModalOpen(false);
          setNewCompanyName('');
        }}
        onSave={handleCompanyCreated}
        initialName={newCompanyName}
      />
    </div>
  );
}

export default Contacts;