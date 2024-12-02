"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CompanyForm } from "./company-form";
import { CompanyTable } from "./company-table";
import { FormModal } from "@/components/ui/form-modal";
import { useToast } from "@/hooks/use-toast";

export function CompanyList() {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      console.log("Submitting form data:", data);
      setIsSubmitting(true);

      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao cadastrar empresa");
      }

      toast({
        title: "Sucesso",
        description: "Empresa cadastrada com sucesso",
      });
      
      setShowForm(false);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao cadastrar empresa:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao cadastrar a empresa",
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
          Nova Empresa
        </Button>
      </div>

      <CompanyTable />

      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Nova Empresa"
        isSubmitting={isSubmitting}
      >
        <CompanyForm onSubmit={handleSubmit} />
      </FormModal>
    </div>
  );
}