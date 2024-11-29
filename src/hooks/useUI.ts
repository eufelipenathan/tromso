import { useUIStore } from '@/stores/uiStore';

export function useUI() {
  const {
    startLoading,
    stopLoading,
    isLoading,
    showGlobalLoading,
    hideGlobalLoading,
    openModal,
    closeModal,
    isModalOpen,
    addToast,
    removeToast
  } = useUIStore();

  return {
    startLoading,
    stopLoading,
    isLoading,
    showGlobalLoading,
    hideGlobalLoading,
    openModal,
    closeModal,
    isModalOpen,
    addToast,
    removeToast
  };
}