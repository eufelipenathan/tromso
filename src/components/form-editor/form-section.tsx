"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Plus, MoreVertical } from "lucide-react";
import { FormField } from "./form-field";
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
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

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
  const [fields, setFields] = useState(section.fields);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCreateField = async (data: any) => {
    try {
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

      onSectionCreated();
      setShowFieldDialog(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao criar o campo",
      });
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

      onSectionCreated();
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

      onSectionCreated();
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

    const oldIndex = fields.findIndex((field: any) => field.id === active.id);
    const newIndex = fields.findIndex((field: any) => field.id === over.id);

    // Optimistic update
    const newFields = arrayMove(fields, oldIndex, newIndex);
    setFields(newFields);

    try {
      const response = await fetch("/api/form-sections/fields/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldId: active.id,
          newIndex,
          sectionId: section.id,
        }),
      });

      if (!response.ok) throw new Error("Falha ao reordenar campos");
    } catch (error) {
      // Rollback on error
      setFields(fields);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao reordenar campos",
      });
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
          {fields?.length === 0 ? (
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
                items={fields.map((f: any) => f.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="grid grid-cols-2 gap-4">
                  {fields?.map((field: any, fieldIndex: number) => (
                    <FormField
                      key={field.id}
                      field={field}
                      index={fieldIndex}
                      sectionId={section.id}
                      sections={sections}
                      onUpdate={onSectionCreated}
                      onDelete={onSectionCreated}
                      onMove={onSectionCreated}
                      existingFields={fields}
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
        existingFields={fields}
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
