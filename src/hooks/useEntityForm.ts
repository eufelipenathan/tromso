import { useState, useCallback } from 'react';
import { useEntityState } from './useEntityState';
import { SupportedEntity } from '@/lib/entity-management/types';

interface EntityFormOptions<T> {
  onSave: (entity: T) => Promise<void>;
  validate?: (entity: T) => Record<string, string>;
  onSuccess?: (entity: T) => void;
  onError?: (error: Error) => void;
}

export function useEntityForm<T extends SupportedEntity>(
  initialEntity: T | null,
  options: EntityFormOptions<T>
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const {
    entity,
    error: saveError,
    isLoading,
    setEntity,
    updateEntity
  } = useEntityState<T>(initialEntity, {
    onSuccess: options.onSuccess,
    onError: options.onError
  });

  const validateForm = useCallback((data: T) => {
    if (!options.validate) return true;

    const validationErrors = options.validate(data);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [options.validate]);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setEntity(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
    setTouched(prev => ({ ...prev, [field]: true }));
  }, [setEntity]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!entity) return;

    if (!validateForm(entity)) {
      return;
    }

    await updateEntity(
      async () => options.onSave(entity),
      entity
    );
  }, [entity, validateForm, options.onSave, updateEntity]);

  return {
    entity,
    errors: { ...errors, submit: saveError },
    touched,
    isLoading,
    handleChange,
    handleSubmit,
    setEntity,
    setErrors,
    setTouched
  };
}