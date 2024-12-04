"use client";

import { useState, useEffect, useCallback } from "react";
import { FormSection } from "./form-section";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useToast } from "@/hooks/use-toast";
import { useFormEditorStore } from "@/stores/use-form-editor-store";

interface FormEditorProps {
  entityType: string;
}

export function FormEditor({ entityType }: FormEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { sections, setSections, reorderSections } = useFormEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const loadSections = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/form-sections?entityType=${entityType}`
      );
      if (!response.ok) throw new Error("Falha ao carregar seções");
      const data = await response.json();
      setSections(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar seções",
      });
    } finally {
      setIsLoading(false);
    }
  }, [entityType, toast, setSections]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Optimistic update
      reorderSections(activeId, overId);

      try {
        const response = await fetch("/api/form-sections/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId: activeId,
            newIndex: sections.findIndex((s) => s.id === overId),
          }),
        });

        if (!response.ok) throw new Error("Falha ao reordenar seções");

        // Refresh sections after reordering
        await loadSections();
      } catch (error) {
        // Revert on error
        await loadSections();
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha ao reordenar seções",
        });
      }
    },
    [sections, toast, reorderSections, loadSections]
  );

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Carregando seções...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sections.length === 0 ? (
        <div className="rounded-lg border bg-card p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium">Nenhuma seção configurada</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Clique no botão "Nova Seção" para começar a configurar o
              formulário
            </p>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((section) => section.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {sections.map((section, index) => (
                <FormSection
                  key={section.id}
                  section={section}
                  index={index}
                  sections={sections}
                  onSectionCreated={loadSections}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
