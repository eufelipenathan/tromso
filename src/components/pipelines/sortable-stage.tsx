"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { usePipelineStore } from "@/stores/use-pipeline-store";

interface SortableStageProps {
  stage: {
    id: string;
    name: string;
    order: number;
  };
}

export function SortableStage({ stage }: SortableStageProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const removeStage = usePipelineStore((state) => state.removeStage);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center justify-between p-4 bg-background hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <button
            className="touch-none text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <span>{stage.name}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir estágio"
        description="Tem certeza que deseja excluir este estágio? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        onConfirm={() => removeStage(stage.id)}
      />
    </>
  );
}