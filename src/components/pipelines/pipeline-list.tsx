"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PipelineForm } from "./pipeline-form";
import { FormModal } from "@/components/ui/form-modal";
import { useToast } from "@/hooks/use-toast";
import { SortableList } from "./sortable-list";
import { Pipeline } from "@prisma/client";

export function PipelineList() {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(
        "/api/pipelines" + (editingPipeline ? `/${editingPipeline.id}` : ""),
        {
          method: editingPipeline ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erro ao ${editingPipeline ? "atualizar" : "cadastrar"} pipeline`
        );
      }

      toast({
        title: "Sucesso",
        description: `Pipeline ${
          editingPipeline ? "atualizado" : "cadastrado"
        } com sucesso`,
      });

      setShowForm(false);
      setEditingPipeline(null);
      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Ocorreu um erro inesperado",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline);
    setShowForm(true);
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pipeline
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <SortableList onEdit={handleEdit} />
      </div>

      <FormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPipeline(null);
        }}
        title={editingPipeline ? "Editar Pipeline" : "Novo Pipeline"}
        isSubmitting={isSubmitting}
        formId="pipeline-form"
      >
        <PipelineForm initialData={editingPipeline} onSubmit={handleSubmit} />
      </FormModal>
    </div>
  );
}
