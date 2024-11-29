import { useCallback } from 'react';
import { useFormContext } from './useFormContext';
import { useUI } from '../useUI';

interface UseFormSubmitOptions<T> {
  onSubmit: (data: T) => Promise<void>;
  validate?: (data: T) => Record<string, string>;
}

export function useFormSubmit<T extends Record<string, any>>({
  onSubmit,
  validate
}: UseFormSubmitOptions<T>) {
  const { data, setErrors } = useFormContext();
  const { startLoading, stopLoading } = useUI();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (validate) {
      const validationErrors = validate(data as T);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    try {
      startLoading('form-submit');
      await onSubmit(data as T);
      setErrors({});
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message });
      }
    } finally {
      stopLoading('form-submit');
    }
  }, [data, validate, onSubmit, setErrors, startLoading, stopLoading]);

  return handleSubmit;
}