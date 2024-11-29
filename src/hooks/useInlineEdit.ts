import { useState, useCallback } from 'react';
import { useOptimisticUpdate } from './useOptimisticUpdate';

interface UseInlineEditOptions<T> {
  onSave: (value: T) => Promise<boolean>;
  validate?: (value: T) => { isValid: boolean; error?: string };
  required?: boolean;
}

export function useInlineEdit<T>({ onSave, validate, required }: UseInlineEditOptions<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<T | null>(null);
  const [error, setError] = useState<string>();
  const { execute } = useOptimisticUpdate<T>();

  const validateField = useCallback((value: T) => {
    setError(undefined);

    if (required && !value) {
      setError('Campo obrigatório');
      return false;
    }

    if (!required && !value) {
      return true;
    }

    if (validate) {
      const result = validate(value);
      if (!result.isValid) {
        setError(result.error || 'Valor inválido');
        return false;
      }
    }

    return true;
  }, [required, validate]);

  const handleSave = useCallback(async (value: T, originalValue: T) => {
    if (!validateField(value)) return;

    try {
      await execute(
        async () => onSave(value),
        value,
        originalValue,
        {
          onSuccess: () => {
            setIsEditing(false);
            setError(undefined);
          },
          onError: (error) => {
            setError(error.message);
            setEditValue(originalValue);
          }
        }
      );
    } catch (error) {
      // Error already handled by execute
    }
  }, [validateField, execute, onSave]);

  const handleCancel = useCallback(() => {
    setEditValue(null);
    setError(undefined);
    setIsEditing(false);
  }, []);

  const startEditing = useCallback((initialValue: T) => {
    setEditValue(initialValue);
    setIsEditing(true);
  }, []);

  return {
    isEditing,
    editValue,
    error,
    startEditing,
    setEditValue,
    handleSave,
    handleCancel
  };
}