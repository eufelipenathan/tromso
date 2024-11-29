import { create } from 'zustand';
import { Deal } from '@/types/pipeline';

interface DealState {
  deals: Deal[];
  setDeals: (deals: Deal[]) => void;
  addDeal: (deal: Deal) => void;
  updateDeal: (id: string, deal: Partial<Deal>) => void;
  removeDeal: (id: string) => void;
  getDeal: (id: string) => Deal | undefined;
  getDealsForPipeline: (pipelineId: string) => Deal[];
}

export const useDealStore = create<DealState>((set, get) => ({
  deals: [],

  setDeals: (deals) => set({ deals }),

  addDeal: (deal) => set((state) => ({
    deals: [...state.deals, deal]
  })),

  updateDeal: (id, updates) => set((state) => ({
    deals: state.deals.map((deal) =>
      deal.id === id ? { ...deal, ...updates } : deal
    )
  })),

  removeDeal: (id) => set((state) => ({
    deals: state.deals.filter((deal) => deal.id !== id)
  })),

  getDeal: (id) => get().deals.find((deal) => deal.id === id),

  getDealsForPipeline: (pipelineId) => 
    get().deals.filter((deal) => deal.pipelineId === pipelineId)
}));