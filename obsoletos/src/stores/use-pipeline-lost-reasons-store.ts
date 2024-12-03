import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

interface PipelineLostReason {
  id: string;
  name: string;
  order: number;
  isTemporary?: boolean;
}

interface PipelineLostReasonsStore {
  lostReasons: PipelineLostReason[];
  addLostReason: (name: string) => void;
  removeLostReason: (id: string) => void;
  reorderLostReasons: (activeId: string, overId: string) => void;
  setLostReasons: (reasons: PipelineLostReason[]) => void;
  reset: () => void;
}

export const usePipelineLostReasonsStore = create<PipelineLostReasonsStore>((set) => ({
  lostReasons: [],
  
  addLostReason: (name) => set((state) => ({
    lostReasons: [
      ...state.lostReasons,
      { 
        id: uuidv4(), 
        name, 
        order: state.lostReasons.length,
        isTemporary: true
      }
    ]
  })),
  
  removeLostReason: (id) => set((state) => ({
    lostReasons: state.lostReasons.filter((reason) => reason.id !== id)
  })),
  
  reorderLostReasons: (activeId, overId) => set((state) => {
    const oldIndex = state.lostReasons.findIndex((r) => r.id === activeId);
    const newIndex = state.lostReasons.findIndex((r) => r.id === overId);
    
    const newReasons = [...state.lostReasons];
    const [movedReason] = newReasons.splice(oldIndex, 1);
    newReasons.splice(newIndex, 0, movedReason);
    
    return { 
      lostReasons: newReasons.map((reason, index) => ({ 
        ...reason, 
        order: index 
      }))
    };
  }),

  setLostReasons: (reasons) => set({ lostReasons: reasons }),
  
  reset: () => set({ lostReasons: [] }),
}));