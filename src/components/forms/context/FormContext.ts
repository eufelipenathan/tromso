import { createContext, useContext } from 'react';
import { FormStyles } from '../types';

interface FormContextType {
  styles: FormStyles;
  variant: 'default' | 'inline';
}

export const FormContext = createContext<FormContextType | undefined>(undefined);

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}