"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContactForm } from "./contact-form";
import { ContactTable } from "./contact-table";
import { FormModal } from "@/components/ui/form-modal";
import { useToast } from "@/hooks/use-toast";
import { ContactFormData } from "@/lib/validations";

export function ContactList() {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar contato");
      }

      toast({
        title: "Sucesso",
        description: "Contato cadastrado com sucesso",
      });

      setShowForm(false);
      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar o contato",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Contato
        </Button>
      </div>

      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Novo Contato"
        isSubmitting={isSubmitting}
        formId="contact-form"
      >
        <ContactForm onSubmit={handleSubmit} />
      </FormModal>

      <ContactTable />
    </div>
  );
}