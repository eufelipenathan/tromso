import React, { createContext, useContext, useState } from 'react';

interface ModalContextType {
  contentHeight: number;
  setContentHeight: (height: number) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  console.log('[ModalProvider] Initializing');
  const [contentHeight, setContentHeight] = useState(0);

  return (
    <ModalContext.Provider value={{ contentHeight, setContentHeight }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
}