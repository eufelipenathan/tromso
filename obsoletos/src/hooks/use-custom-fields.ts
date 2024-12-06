"use client";

import { useEffect, useState } from "react";

interface CustomField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  fullWidth: boolean;
  multiple: boolean;
  visible: boolean;
  editable: boolean;
  options?: string;
  order: number;
}

interface Section {
  id: string;
  name: string;
  fields: CustomField[];
}

export function useCustomFields(entityType: "company" | "contact" | "deal") {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSections() {
      try {
        const response = await fetch(
          `/api/form-sections?entityType=${entityType}`
        );
        if (!response.ok) throw new Error("Failed to load custom fields");
        const data = await response.json();
        setSections(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    loadSections();
  }, [entityType]);

  return { sections, isLoading, error };
}
