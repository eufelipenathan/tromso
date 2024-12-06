"use client";

import { useState, useEffect } from "react";
import { useCustomFields } from "./use-custom-fields";

export function usePreloadFields(entityType: "company" | "contact" | "deal") {
  const [isReady, setIsReady] = useState(false);
  const { sections, isLoading, error } = useCustomFields(entityType);

  useEffect(() => {
    if (!isLoading) {
      setIsReady(true);
    }
  }, [isLoading]);

  return {
    isReady,
    sections,
    error
  };
}