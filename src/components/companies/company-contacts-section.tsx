"use client";

import { useEffect } from "react";
import { Search, Plus, Trash2, Edit2, Clock } from "lucide-react";
import {
  Input,
  Button,
  FormModal,
  ConfirmationDialog,
  Badge,
  FormSection,
} from "@/components/ui";
import { Contact } from "@prisma/client";
import { useCompanyContactsStore } from "@/stores/use-company-contacts-store";
import { ContactForm } from "@/components/contacts/contact-form";
import { useToast } from "@/hooks/use-toast";

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

  const { toast } = useToast();

  useEffect(() => {
    const searchContacts = async () => {
      if (!searchTerm) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch(`/api/contacts/search?q=${searchTerm}`);
        if (!response.ok) throw new Error("Erro ao buscar contatos");
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha ao buscar contatos",
        });
      }
    };

    const debounce = setTimeout(searchContacts, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, setSearchResults, toast]);

  const handleDissociateContact = async (contact: Contact) => {
    try {
      const response = await fetch(`/api/contacts/${contact.id}/dissociate`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Erro ao remover contato");

      removeSelectedContact(contact.id);
      toast({
        title: "Sucesso",
        description: "Contato removido com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao remover contato",
      });
    }
  };

  const handleNewContactClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Previne a propagação do evento para o formulário pai
    setShowContactForm(true);
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
                      setSearchTerm("");
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
          <Button onClick={handleNewContactClick}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contato
          </Button>
        </div>

        {(temporaryContacts.length > 0 || selectedContacts.length > 0) && (
          <div className="space-y-2">
            {temporaryContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{contact.name}</span>
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Temporário</span>
                      </Badge>
                    </div>
                    {contact.email && (
                      <span className="text-sm text-muted-foreground">
                        {contact.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedContact(contact);
                      setShowContactForm(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedContact(contact);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {selectedContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <span className="font-medium">{contact.name}</span>
                  {contact.email && (
                    <span className="block text-sm text-muted-foreground">
                      {contact.email}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedContact(contact);
                      setShowContactForm(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDissociateContact(contact)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FormModal
        open={showContactForm}
        onClose={() => {
          setShowContactForm(false);
          setSelectedContact(null);
        }}
        title={selectedContact ? "Editar Contato" : "Novo Contato"}
        isSubmitting={isLoading}
        formId="contact-form"
      >
        <ContactForm
          initialData={selectedContact || { name: searchTerm }}
          onSubmit={async (data) => {
            if (selectedContact?.id.startsWith("temp_")) {
              updateTemporaryContact(selectedContact.id, data);
            } else if (!selectedContact) {
              addTemporaryContact(data);
            }
            setShowContactForm(false);
            setSelectedContact(null);
          }}
        />
      </FormModal>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir contato"
        description="Tem certeza que deseja excluir este contato? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        onConfirm={() => {
          if (selectedContact) {
            if (selectedContact.id.startsWith("temp_")) {
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
