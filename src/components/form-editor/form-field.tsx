"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { GripVertical, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { FieldDialog } from "./field-dialog";
import { MoveFieldDialog } from "./move-field-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { getFieldTypeLabel } from "@/lib/field-types";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface FormFieldProps {
  field: any;
  index: number;
  sectionId: string;
  sections: Array<{ id: string; name: string }>;
  onUpdate?: (field: any) => void;
  onDelete?: (field: any) => void;
  onMove?: (field: any, targetSectionId: string) => void;
  existingFields?: { name: string }[];
}

export function FormField({
  field,
  index,
  sectionId,
  sections,
  onUpdate,
  onDelete,
  onMove,
  existingFields = [],
}: FormFieldProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const { toast } = useToast();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none",
  };

  const handleUpdateField = async (data: any) => {
    try {
      const response = await fetch(`/api/form-sections/fields/${field.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar campo");
      }

      const updatedField = await response.json();
      onUpdate?.(updatedField);

      toast({
        title: "Sucesso",
        description: "Campo atualizado com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o campo",
      });
    }
  };

  const handleDeleteField = async () => {
    try {
      const response = await fetch(`/api/form-sections/fields/${field.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir campo");
      }

      onDelete?.(field);

      toast({
        title: "Sucesso",
        description: "Campo excluído com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao excluir o campo",
      });
    }
  };

  const handleMoveField = async (targetSectionId: string) => {
    try {
      const response = await fetch(
        `/api/form-sections/fields/${field.id}/move`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetSectionId }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao mover campo");
      }

      onMove?.(field, targetSectionId);

      toast({
        title: "Sucesso",
        description: "Campo movido com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao mover o campo",
      });
    }
  };

  const handleRequiredChange = async (required: boolean) => {
    await handleUpdateField({ required });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${field.fullWidth ? "col-span-2" : ""}`}
      {...attributes}
    >
      <Card className="bg-background border shadow-sm hover:border-primary/50 transition-colors">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2 min-w-0">
              <button
                className="mt-1 touch-none text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <Label className="block truncate">{field.name}</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Tipo: {getFieldTypeLabel(field.type)}
                  {field.multiple && " (múltipla escolha)"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.required}
                  onCheckedChange={handleRequiredChange}
                />
                <Label className="text-xs">Obrigatório</Label>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowMoveDialog(true)}>
                    Mover para...
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Card>

      <FieldDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={handleUpdateField}
        initialData={field}
        existingFields={existingFields}
      />

      <MoveFieldDialog
        open={showMoveDialog}
        onOpenChange={setShowMoveDialog}
        onMove={handleMoveField}
        currentSectionId={sectionId}
        sections={sections}
      />

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir campo"
        description="Tem certeza que deseja excluir este campo? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        onConfirm={handleDeleteField}
      />
    </div>
  );
}
