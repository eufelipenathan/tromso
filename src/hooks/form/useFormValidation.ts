import { useCallback } from 'react';
import { getFieldValidator } from '@/lib/form-validation';

interface UseFormValidationOptions {
  required?: boolean;
  fieldKey?: string;
  customValidate?: (value: any) => { isValid: boolean; error?: string };
}

export function useFormValidation({
  required,
  fieldKey,
  customValidate
}: UseFormValidationOptions = {}) {
  const fieldValidator = getFieldValidator(fieldKey);

  const validate = useCallback((value: any) => {
    if (required && !value) {
      return { isValid: false, error: 'Campo obrigatório' };
    }

    if (!value) {
      return { isValid: true };
    }

    if (customValidate) {
      return customValidate(value);
    }

    if (fieldValidator) {
      return fieldValidator.validate(value);
    }

    return { isValid: true };
  }, [required, customValidate, fieldValidator]);

  const mask = useCallback((value: string) => {
    if (fieldValidator?.mask) {
      return fieldValidator.mask(value);
    }
    return value;
  }, [fieldValidator]);

  return {
    validate,
    mask
  };
}