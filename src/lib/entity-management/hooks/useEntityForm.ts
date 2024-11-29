import { useState, useEffect } from 'react';
import { useUI } from '@/hooks/useUI';
import { useEntityOperations } from './useEntityOperations';
import { EntityManagementConfig, SupportedEntity } from '../types';

interface UseEntityFormProps<T extends SupportedEntity> {
  config: EntityManagementConfig<T>;
  onSave: (id: string, entity: T) => Promise<void>;
  initialData?: Partial<T>;
  entity?: T;
}

export function useEntityForm<T extends SupportedEntity>({
  config,
  onSave,
  initialData,
  entity
}: UseEntityFormProps<T>) {
  const [currentData, setCurrentData] = useState<Partial<T>>(initialData || {});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { startLoading, stopLoading } = useUI();
  const { saveEntity, error: operationError } = useEntityOperations(config);

  // Initialize form with entity data when editing
  useEffect(() => {
    if (entity) {
      setCurrentData(entity);
    }
  }, [entity]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Add your form validation logic here
    // You can use config.validateEntity or add more specific validations

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const loadingKey = entity ? `edit-${config.collectionName}` : `new-${config.collectionName}`;
    startLoading(loadingKey);

    try {
      const result = await saveEntity(currentData);
      
      if (result) {
        await onSave(result.id, result.entity);
      }
    } finally {
      stopLoading(loadingKey);
    }
  };

  return {
    currentData,
    setCurrentData,
    formErrors,
    operationError,
    handleSubmit
  };
}