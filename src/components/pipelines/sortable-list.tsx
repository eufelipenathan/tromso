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
import { Pipeline } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

interface SortableListProps {
  onEdit: (pipeline: Pipeline) => void;
}

export function SortableList({ onEdit }: SortableListProps) {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    try {
      const response = await fetch("/api/pipelines");
      if (!response.ok) throw new Error("Falha ao carregar pipelines");
      const data = await response.json();
      setPipelines(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar pipelines",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pipelines.findIndex((pipeline) => pipeline.id === active.id);
    const newIndex = pipelines.findIndex((pipeline) => pipeline.id === over.id);

    const newPipelines = arrayMove(pipelines, oldIndex, newIndex);
    
    // Optimistic update
    setPipelines(newPipelines);

    try {
      const response = await fetch(`/api/pipelines/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pipelineId: active.id,
          newIndex,
        }),
      });

      if (!response.ok) throw new Error("Falha ao reordenar pipelines");
    } catch (error) {
      // Rollback on error
      setPipelines(pipelines);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao reordenar pipelines",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center text-sm text-muted-foreground">
          Carregando pipelines...
        </div>
      </div>
    );
  }

  if (pipelines.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center text-sm text-muted-foreground">
          Nenhum pipeline cadastrado
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pipelines.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y">
            {pipelines.map((pipeline) => (
              <SortableItem
                key={pipeline.id}
                pipeline={pipeline}
                onEdit={() => onEdit(pipeline)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}