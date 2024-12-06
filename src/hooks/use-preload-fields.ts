"use client";

import { useState } from "react";
import { useCustomFields } from "./use-custom-fields";

export function usePreloadFields(entityType: "company" | "contact" | "deal") {
  const [isReady, setIsReady] = useState(false);
  const { sections, isLoading, error } = useCustomFields(entityType);

  // Considera pronto quando terminar de carregar (com ou sem erro)
  if (!isReady && !isLoading) {
    setIsReady(true);
  }

  return {
    isReady,
    sections,
    error
  };
}