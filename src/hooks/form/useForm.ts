import { useState, useCallback } from 'react';
import { useUI } from '../useUI';

interface UseFormOptions<T> {
  onSubmit: (data: T) => Promise<void>;
  validate?: (data: T) => Record<string, string>;
  initialData?: Partial<T>;
}

export function useForm<T extends Record<string, unknown>>({
  onSubmit,
  validate,
  initialData = {}
}: UseFormOptions<T>) {
  const [data, setData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { startLoading, stopLoading } = useUI();

  const handleChange = useCallback((field: keyof T, value: unknown) => {
    setData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

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
  }, [data, validate, onSubmit, startLoading, stopLoading]);

  return {
    data,
    errors,
    touched,
    handleChange,
    handleSubmit,
    setData,
    setErrors,
    setTouched
  };
}