import { create } from 'zustand';

interface LoadingState {
  [key: string]: boolean;
}

interface UIState {
  // Loading states
  loadingStates: LoadingState;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key: string) => boolean;

  // Global loading
  globalLoading: {
    show: boolean;
    title?: string;
    description?: string;
  };
  showGlobalLoading: (options?: { title?: string; description?: string }) => void;
  hideGlobalLoading: () => void;

  // Modals
  activeModals: string[];
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  isModalOpen: (modalId: string) => boolean;

  // Toasts
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
  }>;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Loading states
  loadingStates: {},
  startLoading: (key) =>
    set((state) => ({
      loadingStates: { ...state.loadingStates, [key]: true }
    })),
  stopLoading: (key) =>
    set((state) => ({
      loadingStates: { ...state.loadingStates, [key]: false }
    })),
  isLoading: (key) => get().loadingStates[key] || false,

  // Global loading
  globalLoading: {
    show: false
  },
  showGlobalLoading: (options) =>
    set({
      globalLoading: {
        show: true,
        ...options
      }
    }),
  hideGlobalLoading: () =>
    set({
      globalLoading: {
        show: false
      }
    }),

  // Modals
  activeModals: [],
  openModal: (modalId) =>
    set((state) => ({
      activeModals: [...state.activeModals, modalId]
    })),
  closeModal: (modalId) =>
    set((state) => ({
      activeModals: state.activeModals.filter((id) => id !== modalId)
    })),
  isModalOpen: (modalId) => get().activeModals.includes(modalId),

  // Toasts
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: Math.random().toString(36).substr(2, 9)
        }
      ]
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
}));