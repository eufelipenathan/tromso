import { useState, useCallback } from 'react';
import { Company } from '@/types';
import { useUI } from '@/hooks/useUI';
import { validateCompany, validateField } from '../utils/validators';
import { normalizeCompany } from '../utils/normalizers';
import { searchCep } from '../services/cepService';

interface UseCompanyFormProps {
  initialData?: Partial<Company>;
  onSave: (data: Partial<Company>) => Promise<void>;
  onCancel: () => void;
}

export function useCompanyForm({ initialData, onSave, onCancel }: UseCompanyFormProps) {
  const [formData, setFormData] = useState<Partial<Company>>(
    initialData || {
      phones: [],
      emails: [],
      address: {
        cep: '',
        street: '',
        number: '',
        district: '',
        city: '',
        state: '',
      },
      customFields: {}
    }
  );
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const { startLoading, stopLoading } = useUI();

  const handleChange = useCallback((field: keyof Company, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleBlur = useCallback((field: keyof Company) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    const validation = validateField(field, formData[field]);
    if (!validation.isValid) {
      setFormErrors(prev => ({ ...prev, [field]: validation.error! }));
    } else {
      setFormErrors(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
    }
  }, [formData]);

  const handleAddressChange = useCallback((field: keyof Company['address'], value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address!,
        [field]: value
      }
    }));
  }, []);

  const handleAddressBlur = useCallback(async (field: keyof Company['address']) => {
    setTouchedFields(prev => ({ ...prev, [`address.${field}`]: true }));
    
    const validation = validateField(`address.${field}`, formData.address?.[field]);
    if (!validation.isValid) {
      setFormErrors(prev => ({ ...prev, [`address.${field}`]: validation.error! }));
      return;
    }
    
    setFormErrors(prev => {
      const { [`address.${field}`]: removed, ...rest } = prev;
      return rest;
    });

    // Search CEP when field is CEP and valid
    if (field === 'cep' && validation.isValid && formData.address?.cep) {
      const address = await searchCep(formData.address.cep);
      
      if (address) {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address!,
            ...address
          }
        }));
      } else {
        setFormErrors(prev => ({
          ...prev,
          'address.cep': 'CEP não encontrado'
        }));
      }
    }
  }, [formData.address]);

  const validateForm = useCallback(() => {
    const normalized = normalizeCompany(formData);
    const validation = validateCompany(normalized);

    // Mark all fields as touched
    const allFields = Object.keys(validation.errors).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {});
    setTouchedFields(prev => ({ ...prev, ...allFields }));

    setFormErrors(validation.errors);
    return validation.isValid;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const loadingKey = formData.id ? `edit-company-${formData.id}` : 'new-company';

    try {
      startLoading(loadingKey);
      const normalized = normalizeCompany(formData);
      await onSave(normalized);
    } catch (error) {
      setFormErrors({ submit: 'Erro ao salvar empresa' });
    } finally {
      stopLoading(loadingKey);
    }
  }, [formData, validateForm, onSave, startLoading, stopLoading]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return {
    formData,
    formErrors,
    touchedFields,
    handleChange,
    handleBlur,
    handleAddressChange,
    handleAddressBlur,
    handleSubmit,
    handleCancel
  };
}