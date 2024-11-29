import { createContext, useContext } from 'react';
import { FormStyles } from '@/components/forms/types';

interface FormContextType {
  data: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleChange: (field: string, value: any) => void;
  setErrors: (errors: Record<string, string>) => void;
  setTouched: (touched: Record<string, boolean>) => void;
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