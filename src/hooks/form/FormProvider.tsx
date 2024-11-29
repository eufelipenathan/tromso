import React from 'react';
import { FormContext } from './useFormContext';
import { useFormState } from './useFormState';

interface FormProviderProps<T> {
  children: React.ReactNode;
  initialData?: Partial<T>;
  variant?: 'default' | 'inline';
}

export function FormProvider<T extends Record<string, any>>({
  children,
  initialData,
  variant = 'default',
}: FormProviderProps<T>) {
  const formState = useFormState<T>({ initialData });

  const styles = variant === 'inline' ? inlineStyles : defaultStyles;

  return (
    <FormContext.Provider value={{ ...formState, styles, variant }}>
      {children}
    </FormContext.Provider>
  );
}

const defaultStyles = {
  container: 'space-y-1',
  label: 'block text-sm font-medium text-gray-700',
  required: 'text-red-500 ml-1',
  input:
    'block w-full rounded-md border shadow-sm text-sm h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  inputError: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  errorIcon: 'absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500',
  errorMessage: 'text-sm text-red-600',
};

const inlineStyles = {
  container: 'relative',
  label: 'text-xs font-medium text-gray-600',
  required: 'text-red-500 ml-1',
  input:
    'block w-full rounded border shadow-sm text-xs px-2 py-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  inputError: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  errorIcon: 'absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-red-500',
  errorMessage: 'mt-1 text-xs text-red-600',
};
