"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

interface FormSection {
  id: string;
  name: string;
  order: number;
  fields: FormField[];
}

interface FormField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  fullWidth: boolean;
  order: number;
  options?: string;
  multiple?: boolean;
}

interface FormEditorStore {
  sections: FormSection[];
  setSections: (sections: FormSection[]) => void;
  addSection: (name: string) => void;
  updateSection: (id: string, name: string) => void;
  removeSection: (id: string) => void;
  reorderSections: (activeId: string, overId: string) => void;
  addField: (sectionId: string, field: Omit<FormField, "id" | "order">) => void;
  updateField: (
    sectionId: string,
    fieldId: string,
    field: Partial<FormField>
  ) => void;
  removeField: (sectionId: string, fieldId: string) => void;
  reorderFields: (sectionId: string, activeId: string, overId: string) => void;
  moveField: (
    field: FormField,
    fromSectionId: string,
    toSectionId: string
  ) => void;
  reset: () => void;
}

export const useFormEditorStore = create<FormEditorStore>((set, get) => ({
  sections: [],

  setSections: (sections) => set({ sections }),

  addSection: (name) =>
    set((state) => ({
      sections: [
        ...state.sections,
        {
          id: uuidv4(),
          name,
          order: state.sections.length,
          fields: [],
        },
      ],
    })),

  updateSection: (id, name) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === id ? { ...section, name } : section
      ),
    })),

  removeSection: (id) =>
    set((state) => ({
      sections: state.sections.filter((section) => section.id !== id),
    })),

  reorderSections: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.sections.findIndex((s) => s.id === activeId);
      const newIndex = state.sections.findIndex((s) => s.id === overId);

      const newSections = [...state.sections];
      const [movedSection] = newSections.splice(oldIndex, 1);
      newSections.splice(newIndex, 0, movedSection);

      return {
        sections: newSections.map((section, index) => ({
          ...section,
          order: index,
        })),
      };
    }),

  addField: (sectionId, field) =>
    set((state) => ({
      sections: state.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            fields: [
              ...section.fields,
              {
                ...field,
                id: uuidv4(),
                order: section.fields.length,
              },
            ],
          };
        }
        return section;
      }),
    })),

  updateField: (sectionId, fieldId, field) =>
    set((state) => ({
      sections: state.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            fields: section.fields.map((f) =>
              f.id === fieldId ? { ...f, ...field } : f
            ),
          };
        }
        return section;
      }),
    })),

  removeField: (sectionId, fieldId) =>
    set((state) => ({
      sections: state.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            fields: section.fields.filter((f) => f.id !== fieldId),
          };
        }
        return section;
      }),
    })),

  reorderFields: (sectionId, activeId, overId) =>
    set((state) => ({
      sections: state.sections.map((section) => {
        if (section.id === sectionId) {
          const oldIndex = section.fields.findIndex((f) => f.id === activeId);
          const newIndex = section.fields.findIndex((f) => f.id === overId);

          const newFields = [...section.fields];
          const [movedField] = newFields.splice(oldIndex, 1);
          newFields.splice(newIndex, 0, movedField);

          return {
            ...section,
            fields: newFields.map((field, index) => ({
              ...field,
              order: index,
            })),
          };
        }
        return section;
      }),
    })),

  moveField: (field, fromSectionId, toSectionId) =>
    set((state) => ({
      sections: state.sections.map((section) => {
        if (section.id === fromSectionId) {
          return {
            ...section,
            fields: section.fields.filter((f) => f.id !== field.id),
          };
        }
        if (section.id === toSectionId) {
          return {
            ...section,
            fields: [
              ...section.fields,
              { ...field, order: section.fields.length },
            ],
          };
        }
        return section;
      }),
    })),

  reset: () => set({ sections: [] }),
}));
