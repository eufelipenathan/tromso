import { useCallback } from 'react';
import { useFormContext } from './useFormContext';
import { useFormValidation } from './useFormValidation';
import { FormFieldProps } from '@/components/forms/types';

export function useFormField({
  name,
  validate: customValidate,
  mask: customMask,
  required,
  fieldKey
}: FormFieldProps) {
  const { data, errors, touched, handleChange } = useFormContext();
  const { validate: fieldValidate, mask: fieldMask } = useFormValidation({
    required,
    fieldKey,
    customValidate
  });

  const mask = customMask || fieldMask;

  const handleFieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (mask) {
      value = mask(value);
    }

    handleChange(name, value);
  }, [name, mask, handleChange]);

  return {
    value: data[name],
    error: touched[name] ? errors[name] : undefined,
    onChange: handleFieldChange,
    validate: fieldValidate,
    mask
  };
}