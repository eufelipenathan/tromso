'use client';

import { ContactForm } from '@/components/contacts/contact-form';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { FormModal } from '@/components/ui/form-modal';
import { FormSection } from '@/components/ui/form-section';
import { Input } from '@/components/ui/input';
import { FORM_MODES } from '@/lib/form-modes';
import type { ContactFormData } from '@/lib/validations';
import { useCompanyContactsStore } from '@/stores/use-company-contacts-store';
import { Plus, Search } from 'lucide-react';
import { ContactCard } from './contact-card';

export function CompanyContactsSection() {
  const {
    temporaryContacts,
    selectedContacts,
    showContactForm,
    searchTerm,
    searchResults,
    selectedContact,
    showDeleteDialog,
    isLoading,
    setShowContactForm,
    setSearchTerm,
    setSearchResults,
    setSelectedContact,
    setShowDeleteDialog,
    addTemporaryContact,
    removeTemporaryContact,
    updateTemporaryContact,
    removeSelectedContact,
  } = useCompanyContactsStore();

  const handleNewContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContactForm(true);
  };

  const handleEditClick = (e: React.MouseEvent, contact: ContactFormData) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedContact(contact);
    setShowContactForm(true);
  };

  const handleRemoveClick = (e: React.MouseEvent, contact: ContactFormData) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedContact(contact);
    setShowDeleteDialog(true);
  };

  const handleContactSubmit = async (data: ContactFormData) => {
    if (selectedContact?.id.startsWith('temp_')) {
      updateTemporaryContact(selectedContact.id, data);
    } else if (!selectedContact) {
      addTemporaryContact(data);
    }
    setShowContactForm(false);
    setSelectedContact(null);
    setSearchTerm('');
  };

  return (
    <FormSection title="Contatos">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              placeholder="Buscar contatos..."
            />
            {searchTerm && searchResults.length === 0 && (
              <div className="absolute z-10 w-full mt-1 p-2 bg-background border rounded-md shadow-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Nenhum contato encontrado
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={handleNewContactClick}
                >
                  Clique aqui para cadastrar
                </Button>
              </div>
            )}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                {searchResults.map((contact) => (
                  <button
                    key={contact.id}
                    className="w-full px-4 py-2 text-left hover:bg-accent"
                    onClick={() => {
                      setSelectedContact(contact);
                      setSearchTerm('');
                      setSearchResults([]);
                    }}
                  >
                    <div className="flex flex-col">
                      <span>{contact.name}</span>
                      {contact.email && (
                        <span className="text-sm text-muted-foreground">
                          {contact.email}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button variant="outline" size="icon" onClick={handleNewContactClick}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {(temporaryContacts.length > 0 || selectedContacts.length > 0) && (
          <div className="grid grid-cols-2 gap-4">
            {temporaryContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={(e) => handleEditClick(e, contact)}
                onRemove={(e) => handleRemoveClick(e, contact)}
              />
            ))}

            {selectedContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={(e) => handleEditClick(e, contact)}
                onRemove={(e) => handleRemoveClick(e, contact)}
              />
            ))}
          </div>
        )}
      </div>

      <FormModal
        open={showContactForm}
        onClose={() => {
          setShowContactForm(false);
          setSelectedContact(null);
          setSearchTerm('');
        }}
        title={selectedContact ? 'Editar Contato' : 'Novo Contato'}
        isSubmitting={isLoading}
        formId="contact-form"
      >
        <ContactForm
          initialData={selectedContact || { name: searchTerm }}
          onSubmit={handleContactSubmit}
          mode={FORM_MODES.COMPANY_NEW}
        />
      </FormModal>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Remover contato"
        description="Tem certeza que deseja remover este contato da lista?"
        confirmText="Remover"
        onConfirm={() => {
          if (selectedContact) {
            if (selectedContact.id.startsWith('temp_')) {
              removeTemporaryContact(selectedContact.id);
            } else {
              removeSelectedContact(selectedContact.id);
            }
            setShowDeleteDialog(false);
            setSelectedContact(null);
          }
        }}
      />
    </FormSection>
  );
}
