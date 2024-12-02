"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LostReasonForm } from "./lost-reason-form";
import { FormModal } from "@/components/ui/form-modal";
import { useToast } from "@/hooks/use-toast";
import { SortableList } from "./sortable-list";
import { LostReason } from "@prisma/client";

export function LostReasonList() {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReason, setEditingReason] = useState<LostReason | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (data: { name: string }) => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/lost-reasons" + (editingReason ? `/${editingReason.id}` : ""), {
        method: editingReason ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Erro ao ${editingReason ? 'atualizar' : 'cadastrar'} motivo de perda`);
      }

      toast({
        title: "Sucesso",
        description: `Motivo de perda ${editingReason ? 'atualizado' : 'cadastrado'} com sucesso`,
      });

      setShowForm(false);
      setEditingReason(null);
      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (reason: LostReason) => {
    setEditingReason(reason);
    setShowForm(true);
  };

  return (
    <div>
      <div className="mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Motivo
        </Button>
      </div>

      <SortableList onEdit={handleEdit} />

      <FormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingReason(null);
        }}
        title={editingReason ? "Editar Motivo" : "Novo Motivo"}
        isSubmitting={isSubmitting}
        formId="lost-reason-form"
      >
        <LostReasonForm
          initialData={editingReason ? { name: editingReason.name } : undefined}
          onSubmit={handleSubmit}
        />
      </FormModal>
    </div>
  );
}