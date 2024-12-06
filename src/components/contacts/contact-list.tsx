"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContactForm } from "./contact-form";
import { ContactTable } from "./contact-table";
import { FormModal } from "@/components/ui/form-modal";
import { useToast } from "@/hooks/use-toast";
import { useContactStore } from "@/stores/use-contact-store";
import { usePreloadFields } from "@/hooks/use-preload-fields";

export function ContactList() {
  const { showContactForm, isSubmitting, setShowContactForm, handleSubmit } =
    useContactStore();
  const { isReady, error } = usePreloadFields("contact");
  const { toast } = useToast();

  const handleOpenForm = () => {
    if (!isReady) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar o formulário. Tente novamente.",
      });
      return;
    }
    setShowContactForm(true);
  };

  const onSubmit = async (data: any) => {
    try {
      await handleSubmit(data);
      toast({
        title: "Sucesso",
        description: "Contato cadastrado com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar o contato",
      });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button onClick={handleOpenForm}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Contato
        </Button>
      </div>

      <ContactTable />

      {showContactForm && isReady && (
        <FormModal
          open={showContactForm}
          onClose={() => setShowContactForm(false)}
          title="Novo Contato"
          isSubmitting={isSubmitting}
          formId="contact-form"
        >
          <ContactForm onSubmit={onSubmit} />
        </FormModal>
      )}
    </div>
  );
}
