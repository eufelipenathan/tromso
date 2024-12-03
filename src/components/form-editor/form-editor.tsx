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

interface FormEditorProps {
  entityType: string;
}

export function FormEditor({ entityType }: FormEditorProps) {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
  }, [entityType, toast]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Check if we're dealing with a section
      const activeSection = sections.find((s) => s.id === activeId);

      if (activeSection) {
        // Section drag
        try {
          const oldIndex = sections.findIndex((s) => s.id === activeId);
          const newIndex = sections.findIndex((s) => s.id === overId);

          // Optimistic update
          const newSections = [...sections];
          const [removed] = newSections.splice(oldIndex, 1);
          newSections.splice(newIndex, 0, removed);
          setSections(newSections);

          const response = await fetch("/api/form-sections/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sectionId: activeId,
              newIndex,
            }),
          });

          if (!response.ok) throw new Error("Falha ao reordenar seções");
        } catch (error) {
          // Revert on error
          setSections(sections);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Falha ao reordenar seções",
          });
        }
      }
    },
    [sections, toast]
  );

  const handleFieldsReorder = useCallback(
    (sectionId: string, newFields: any[]) => {
      setSections((currentSections) =>
        currentSections.map((section) =>
          section.id === sectionId ? { ...section, fields: newFields } : section
        )
      );
    },
    []
  );

  const handleFieldMove = useCallback(
    (field: any, fromSectionId: string, toSectionId: string) => {
      setSections((currentSections) =>
        currentSections.map((section) => {
          if (section.id === fromSectionId) {
            return {
              ...section,
              fields: section.fields.filter((f) => f.id !== field.id),
            };
          }
          if (section.id === toSectionId) {
            return {
              ...section,
              fields: [...section.fields, field],
            };
          }
          return section;
        })
      );
    },
    []
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
                  onFieldsReorder={handleFieldsReorder}
                  onFieldMove={handleFieldMove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
