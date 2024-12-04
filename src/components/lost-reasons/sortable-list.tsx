"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./sortable-item";
import { LostReason } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

interface SortableListProps {
  onEdit: (reason: LostReason) => void;
}

export function SortableList({ onEdit }: SortableListProps) {
  const [reasons, setReasons] = useState<LostReason[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadReasons();
  }, []);

  const loadReasons = async () => {
    try {
      const response = await fetch("/api/lost-reasons");
      if (!response.ok) throw new Error("Falha ao carregar motivos");
      const data = await response.json();
      setReasons(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar motivos de perda",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = reasons.findIndex((reason) => reason.id === active.id);
    const newIndex = reasons.findIndex((reason) => reason.id === over.id);

    const newReasons = arrayMove(reasons, oldIndex, newIndex);

    // Optimistic update
    setReasons(newReasons);

    try {
      const response = await fetch(`/api/lost-reasons/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reasonId: active.id,
          newIndex,
        }),
      });

      if (!response.ok) throw new Error("Falha ao reordenar motivos");
    } catch (error) {
      // Rollback on error
      setReasons(reasons);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao reordenar motivos de perda",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Carregando motivos de perda...
      </div>
    );
  }

  if (reasons.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Nenhum motivo de perda cadastrado
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={reasons.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="divide-y">
          {reasons.map((reason) => (
            <SortableItem
              key={reason.id}
              reason={reason}
              onEdit={() => onEdit(reason)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
