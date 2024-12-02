"use client";

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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableLostReason } from "./sortable-lost-reason";
import { usePipelineStore } from "@/stores/use-pipeline-store";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { LostReason } from "@prisma/client";

export function SortableLostReasons() {
  const [selectedReasons, setSelectedReasons] = useState<LostReason[]>([]);
  const { selectedLostReasonIds, removeLostReason } = usePipelineStore();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const loadSelectedReasons = async () => {
      try {
        const response = await fetch('/api/lost-reasons');
        const allReasons = await response.json();
        const selected = allReasons.filter((reason: LostReason) => 
          selectedLostReasonIds.includes(reason.id)
        );
        setSelectedReasons(selected);
      } catch (error) {
        console.error("Error loading selected reasons:", error);
      }
    };

    loadSelectedReasons();
  }, [selectedLostReasonIds]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selectedReasons.findIndex(r => r.id === active.id);
    const newIndex = selectedReasons.findIndex(r => r.id === over.id);

    // Optimistic update
    const newReasons = [...selectedReasons];
    const [movedReason] = newReasons.splice(oldIndex, 1);
    newReasons.splice(newIndex, 0, movedReason);
    setSelectedReasons(newReasons);

    try {
      // Update order in the backend
      const response = await fetch(`/api/pipelines/${pipelineId}/lost-reasons/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reasonIds: newReasons.map(r => r.id),
        }),
      });

      if (!response.ok) throw new Error("Falha ao reordenar motivos");
    } catch (error) {
      // Rollback on error
      setSelectedReasons(selectedReasons);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao reordenar motivos de perda",
      });
    }
  };

  if (selectedReasons.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center text-sm text-muted-foreground">
          Nenhum motivo de perda vinculado
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={selectedReasons.map(r => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y">
            {selectedReasons.map((reason) => (
              <SortableLostReason
                key={reason.id}
                lostReason={reason}
                onRemove={() => removeLostReason(reason.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}