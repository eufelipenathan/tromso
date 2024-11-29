import React from 'react';
import { FormContext } from '@/hooks/form/useFormContext';

interface FormContextType {
  styles: typeof defaultStyles;
  variant: 'default' | 'inline';
  data: Record<string, string | number | boolean>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleChange: (name: string, value: string | number | boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

interface FormProviderProps {
  children: React.ReactNode;
  variant?: 'default' | 'inline';
  initialData?: Record<string, string | number | boolean>;
  onSubmit?: (data: Record<string, string | number | boolean>) => void;
}

const defaultStyles = {
  container: 'space-y-1',
  label: 'block text-sm font-medium text-gray-700',
  required: 'text-red-500 ml-1',
  input: 'block w-full rounded-md border shadow-sm text-sm h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm',
  inputError: 'border-red-300 focus:border-red-500 focus:ring-red-500 shadow-sm',
  errorIcon: 'absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500',
  errorMessage: 'text-sm text-red-600',
};

const inlineStyles = {
  container: 'relative',
  label: 'text-xs font-medium text-gray-600',
  required: 'text-red-500 ml-1',
  input: 'block w-full rounded border shadow-sm text-xs px-2 py-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  inputError: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  errorIcon: 'absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-red-500',
  errorMessage: 'mt-1 text-xs text-red-600',
};

const FormProvider: React.FC<FormProviderProps> = ({
  children,
  variant = 'default',
  initialData = {},
  onSubmit
}) => {
  const [data, setData] = React.useState<Record<string, string | number | boolean>>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const styles = variant === 'inline' ? inlineStyles : defaultStyles;

  const handleChange = (name: string, value: string | number | boolean) => {
    setData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(data);
    }
  };

  const contextValue: FormContextType = {
    styles,
    variant,
    data,
    errors,
    handleSubmit,
    setErrors,
    setTouched,
    touched,
    handleChange
  };

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
};

export default FormProvider;