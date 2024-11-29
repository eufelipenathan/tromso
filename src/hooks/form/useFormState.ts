import { useState, useCallback } from 'react';

interface UseFormStateOptions<T> {
  initialData?: Partial<T>;
}

export function useFormState<T extends Record<string, any>>({
  initialData = {}
}: UseFormStateOptions<T>) {
  const [data, setData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  return {
    data,
    errors,
    touched,
    setData,
    setErrors,
    setTouched,
    handleChange
  };
}