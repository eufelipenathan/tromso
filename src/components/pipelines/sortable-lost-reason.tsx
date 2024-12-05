"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LostReason } from "@prisma/client";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SortableLostReasonProps {
  lostReason: LostReason;
  onRemove: () => void;
}

export function SortableLostReason({ lostReason, onRemove }: SortableLostReasonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: lostReason.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
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
        <span>{lostReason.name}</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}