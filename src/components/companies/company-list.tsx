"use client";

import { Plus } from "lucide-react";
import { Button, FormModal } from "@/components/ui";
import { CompanyForm } from "./company-form";
import { CompanyTable } from "./company-table";
import { useToast } from "@/hooks/use-toast";
import { useCompanyStore } from "@/stores/use-company-store";
import { useCompanyContactsStore } from "@/stores/use-company-contacts-store";

export function CompanyList() {
  const { showCompanyForm, isSubmitting, setShowCompanyForm, handleSubmit } = useCompanyStore();
  const { temporaryContacts } = useCompanyContactsStore();
  const { toast } = useToast();

  const onSubmit = async (data: any) => {
    try {
      await handleSubmit(data);
      toast({
        title: "Sucesso",
        description: "Empresa cadastrada com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar a empresa",
      });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button onClick={() => setShowCompanyForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </div>

      <CompanyTable />

      <FormModal
        open={showCompanyForm}
        onClose={() => setShowCompanyForm(false)}
        title="Nova Empresa"
        isSubmitting={isSubmitting}
        formId="company-form"
        hasTemporaryData={temporaryContacts.length > 0}
      >
        <CompanyForm onSubmit={onSubmit} />
      </FormModal>
    </div>
  );
}