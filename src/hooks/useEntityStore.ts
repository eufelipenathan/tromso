import { create } from 'zustand';
import { SupportedEntity } from '@/lib/entity-management/types';

interface EntityState {
  entities: Record<string, SupportedEntity[]>;
  setEntities: (type: string, entities: SupportedEntity[]) => void;
  addEntity: (type: string, entity: SupportedEntity) => void;
  updateEntity: (type: string, id: string, entity: SupportedEntity) => void;
  removeEntity: (type: string, id: string) => void;
  getEntity: (type: string, id: string) => SupportedEntity | undefined;
}

export const useEntityStore = create<EntityState>((set, get) => ({
  entities: {},

  setEntities: (type, entities) =>
    set((state) => ({
      entities: {
        ...state.entities,
        [type]: entities
      }
    })),

  addEntity: (type, entity) =>
    set((state) => ({
      entities: {
        ...state.entities,
        [type]: [...(state.entities[type] || []), entity]
      }
    })),

  updateEntity: (type, id, entity) =>
    set((state) => ({
      entities: {
        ...state.entities,
        [type]: state.entities[type]?.map((e) =>
          e.id === id ? { ...e, ...entity } : e
        ) || []
      }
    })),

  removeEntity: (type, id) =>
    set((state) => ({
      entities: {
        ...state.entities,
        [type]: state.entities[type]?.filter((e) => e.id !== id) || []
      }
    })),

  getEntity: (type, id) =>
    get().entities[type]?.find((e) => e.id === id)
}));