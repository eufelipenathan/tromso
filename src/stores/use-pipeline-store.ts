import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

interface Stage {
  id: string;
  name: string;
  order: number;
  isTemporary?: boolean;
}

interface LostReason {
  id: string;
  name: string;
  order: number;
}

interface PipelineStore {
  stages: Stage[];
  selectedLostReasonIds: string[];
  addStage: (name: string) => void;
  removeStage: (id: string) => void;
  reorderStages: (activeId: string, overId: string) => void;
  addLostReason: (id: string) => void;
  removeLostReason: (id: string) => void;
  setSelectedLostReasons: (ids: string[]) => void;
  setStages: (stages: Stage[]) => void;
  getFormData: () => {
    stages: { name: string }[];
    lostReasonIds: string[];
  };
  reset: () => void;
}

export const usePipelineStore = create<PipelineStore>((set, get) => ({
  stages: [],
  selectedLostReasonIds: [],
  
  addStage: (name) => {
    console.log("Adding stage:", name);
    set((state) => ({
      stages: [
        ...state.stages,
        { 
          id: uuidv4(), 
          name, 
          order: state.stages.length,
          isTemporary: true 
        }
      ]
    }));
  },
  
  removeStage: (id) => {
    console.log("Removing stage:", id);
    set((state) => ({
      stages: state.stages.filter((stage) => stage.id !== id)
    }));
  },
  
  reorderStages: (activeId, overId) => {
    console.log("Reordering stages:", { activeId, overId });
    set((state) => {
      const oldIndex = state.stages.findIndex((s) => s.id === activeId);
      const newIndex = state.stages.findIndex((s) => s.id === overId);
      
      const newStages = [...state.stages];
      const [movedStage] = newStages.splice(oldIndex, 1);
      newStages.splice(newIndex, 0, movedStage);
      
      return { 
        stages: newStages.map((stage, index) => ({ 
          ...stage, 
          order: index 
        }))
      };
    });
  },
  
  addLostReason: (id) => {
    console.log("Adding lost reason:", id);
    set((state) => ({
      selectedLostReasonIds: [...state.selectedLostReasonIds, id]
    }));
  },
  
  removeLostReason: (id) => {
    console.log("Removing lost reason:", id);
    set((state) => ({
      selectedLostReasonIds: state.selectedLostReasonIds.filter(reasonId => reasonId !== id)
    }));
  },

  setSelectedLostReasons: (ids) => {
    console.log("Setting selected lost reasons:", ids);
    set({ selectedLostReasonIds: ids });
  },

  setStages: (stages) => {
    console.log("Setting stages:", stages);
    set({ stages });
  },

  getFormData: () => {
    const state = get();
    const formData = {
      stages: state.stages.map(({ name }) => ({ name })),
      lostReasonIds: state.selectedLostReasonIds
    };
    console.log("Getting form data:", formData);
    return formData;
  },
  
  reset: () => {
    console.log("Resetting store");
    set({ 
      stages: [], 
      selectedLostReasonIds: [] 
    });
  },
}));