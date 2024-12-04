"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Plus, MoreVertical } from "lucide-react";
import { FormField } from "./form-field";
import { useState } from "react";
import { FieldDialog } from "./field-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { SectionDialog } from "./section-dialog";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useFormEditorStore } from "@/stores/use-form-editor-store";

interface FormSectionProps {
  section: any;
  index: number;
  sections: any[];
  onSectionCreated: () => void;
}

export function FormSection({
  section,
  index,
  sections,
  onSectionCreated,
}: FormSectionProps) {
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();
  const {
    updateSection,
    removeSection,
    addField,
    updateField,
    removeField,
    reorderFields,
    moveField,
  } = useFormEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCreateField = async (data: any) => {
    // Check if field name already exists in this section
    const fieldExists = section.fields.some(
      (field: any) => field.name.toLowerCase() === data.name.toLowerCase()
    );

    if (fieldExists) {
      toast({
        variant: "warning",
        title: "Atenção",
        description:
          "Já existe um campo com este nome nesta seção. Por favor, escolha um nome diferente.",
      });
      return false;
    }

    try {
      // Optimistic update
      addField(section.id, data);

      const response = await fetch(`/api/form-sections/${section.id}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar campo");
      }

      toast({
        title: "Sucesso",
        description: "Campo criado com sucesso",
      });

      onSectionCreated(); // Refresh sections after creating field
      setShowFieldDialog(false);
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao criar o campo",
      });
      return false;
    }
  };

  const handleEditSection = async (data: any) => {
    try {
      const existingSection = sections.find(
        (s) =>
          s.id !== section.id &&
          s.name.toLowerCase() === data.name.toLowerCase()
      );

      if (existingSection) {
        toast({
          variant: "warning",
          title: "Atenção",
          description:
            "Já existe uma seção com este nome. Por favor, escolha um nome diferente.",
        });
        return false;
      }

      // Optimistic update
      updateSection(section.id, data.name);

      const response = await fetch(`/api/form-sections/${section.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar seção");
      }

      toast({
        title: "Sucesso",
        description: "Seção atualizada com sucesso",
      });

      onSectionCreated(); // Refresh sections after updating
      setShowEditDialog(false);
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a seção",
      });
      return false;
    }
  };

  const handleDeleteSection = async () => {
    try {
      if (section.fields.length > 0) {
        toast({
          variant: "warning",
          title: "Aviso",
          description:
            "Não é possível excluir uma seção que contém campos. Remova todos os campos primeiro.",
        });
        return;
      }

      // Optimistic update
      removeSection(section.id);

      const response = await fetch(`/api/form-sections/${section.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir seção");
      }

      toast({
        title: "Sucesso",
        description: "Seção excluída com sucesso",
      });

      onSectionCreated(); // Refresh sections after deleting
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao excluir a seção",
      });
    }
  };

  const handleFieldDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    try {
      // Optimistic update
      reorderFields(section.id, active.id as string, over.id as string);

      const response = await fetch("/api/form-sections/fields/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldId: active.id,
          newIndex: section.fields.findIndex((f: any) => f.id === over.id),
          sectionId: section.id,
        }),
      });

      if (!response.ok) throw new Error("Falha ao reordenar campos");

      onSectionCreated(); // Refresh sections after reordering
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao reordenar campos",
      });
    }
  };

  const handleFieldUpdate = async (updatedField: any) => {
    try {
      // Check if field name already exists in this section (excluding the current field)
      const fieldExists = section.fields.some(
        (field: any) =>
          field.id !== updatedField.id &&
          field.name.toLowerCase() === updatedField.name.toLowerCase()
      );

      if (fieldExists) {
        toast({
          variant: "warning",
          title: "Atenção",
          description:
            "Já existe um campo com este nome nesta seção. Por favor, escolha um nome diferente.",
        });
        return false;
      }

      // Optimistic update
      updateField(section.id, updatedField.id, updatedField);

      const response = await fetch(
        `/api/form-sections/fields/${updatedField.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedField),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar campo");
      }

      toast({
        title: "Sucesso",
        description: "Campo atualizado com sucesso",
      });

      onSectionCreated(); // Refresh sections after updating field
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o campo",
      });
      return false;
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <button
              className="touch-none text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <h3 className="text-base font-semibold">{section.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFieldDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Campo
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    if (section.fields.length > 0) {
                      toast({
                        variant: "warning",
                        title: "Aviso",
                        description:
                          "Não é possível excluir uma seção que contém campos. Remova todos os campos primeiro.",
                      });
                      return;
                    }
                    setShowDeleteDialog(true);
                  }}
                >
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {section.fields?.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Nenhum campo configurado nesta seção
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleFieldDragEnd}
            >
              <SortableContext
                items={section.fields.map((f: any) => f.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="grid grid-cols-2 gap-4">
                  {section.fields?.map((field: any, fieldIndex: number) => (
                    <FormField
                      key={field.id}
                      field={field}
                      index={fieldIndex}
                      sectionId={section.id}
                      sections={sections}
                      onUpdate={handleFieldUpdate}
                      onDelete={() => {
                        removeField(section.id, field.id);
                        onSectionCreated();
                      }}
                      onMove={(field, targetSectionId) => {
                        moveField(field, section.id, targetSectionId);
                        onSectionCreated();
                      }}
                      existingFields={section.fields}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <FieldDialog
        open={showFieldDialog}
        onOpenChange={setShowFieldDialog}
        onSubmit={handleCreateField}
        existingFields={section.fields}
      />

      <SectionDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={handleEditSection}
        initialData={{ name: section.name }}
      />

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir seção"
        description="Tem certeza que deseja excluir esta seção? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        onConfirm={handleDeleteSection}
      />
    </div>
  );
}
