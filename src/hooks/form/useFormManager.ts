import { useState, useCallback } from 'react';
import { useOptimisticUpdate } from '../useOptimisticUpdate';
import { useUI } from '../useUI';

interface FormManagerOptions<T> {
  onSave: (data: T) => Promise<boolean>;
  validate?: (data: T) => Record<string, string>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useFormManager<T extends Record<string, any>>({
  onSave,
  validate,
  onSuccess,
  onError
}: FormManagerOptions<T>) {
  const [data, setData] = useState<Partial<T>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { execute } = useOptimisticUpdate<T>();
  const { startLoading, stopLoading } = useUI();

  const validateForm = useCallback((formData: Partial<T>) => {
    if (!validate) return true;

    const validationErrors = validate(formData as T);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [validate]);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm(data)) {
      return false;
    }

    const loadingKey = 'form-submit';
    startLoading(loadingKey);

    try {
      await execute(
        async () => onSave(data as T),
        data as T,
        data as T,
        {
          loadingKey,
          onSuccess: (savedData) => {
            setErrors({});
            onSuccess?.(savedData);
          },
          onError: (error) => {
            setErrors({ submit: error.message });
            onError?.(error);
          }
        }
      );

      return true;
    } catch (error) {
      return false;
    } finally {
      stopLoading(loadingKey);
    }
  }, [data, validateForm, onSave, execute, startLoading, stopLoading, onSuccess, onError]);

  const reset = useCallback((newData: Partial<T> = {}) => {
    setData(newData);
    setErrors({});
    setTouched({});
  }, []);

  return {
    data,
    errors,
    touched,
    setData,
    setErrors,
    setTouched,
    handleChange,
    handleSubmit,
    reset,
    validateForm
  };
}