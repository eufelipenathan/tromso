"use client";

import { useState, useEffect } from "react";
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
  arrayMove,
} from "@dnd-kit/sortable";
import { useToast } from "@/hooks/use-toast";

interface FormEditorProps {
  entityType: string;
}

export function FormEditor({ entityType }: FormEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState<any[]>([]);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const loadSections = async () => {
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
  };

  useEffect(() => {
    loadSections();
  }, [entityType]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((section) => section.id === active.id);
    const newIndex = sections.findIndex((section) => section.id === over.id);

    // Optimistic update
    const newSections = arrayMove(sections, oldIndex, newIndex);
    setSections(newSections);

    try {
      const response = await fetch("/api/form-sections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: active.id,
          newIndex,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao reordenar seções");
      }
    } catch (error) {
      // Rollback on error
      setSections(sections);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao reordenar seções",
      });
    }
  };

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
