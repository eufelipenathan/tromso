import { useState, useEffect } from 'react';

const STORAGE_KEY = '@crm/last-selected-pipeline';

export function useLastSelectedPipeline() {
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const setLastSelected = (pipelineId: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, pipelineId);
      setLastSelectedId(pipelineId);
    } catch (error) {
      console.error('Error saving last selected pipeline:', error);
    }
  };

  return {
    lastSelectedId,
    setLastSelected
  };
}