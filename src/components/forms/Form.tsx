import React from 'react';
import { FormProvider } from '@/hooks/form';

interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  initialData?: Record<string, unknown>;
  loadingKey?: string;
  className?: string;
}

const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  initialData,
  loadingKey,
  className,
  ...props
}) => {
  console.log('[Form] Render:', { loadingKey, className });

  return (
    <FormProvider initialData={initialData}>
      <form 
        {...props} 
        className={className}
        onSubmit={(e) => {
          console.log('[Form] Submit initiated');
          onSubmit(e);
        }}
      >
        {children}
      </form>
    </FormProvider>
  );
};

export default Form;