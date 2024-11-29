import { useState, useCallback } from 'react';
import { Company } from '@/types';
import { useUI } from '@/hooks/useUI';
import { validateCompany, validateField } from '../utils/validators';
import { normalizeCompany } from '../utils/normalizers';
import { searchCep } from '../services/cepService';
import { maskCEP } from '@/utils/masks';

interface UseCompanyFormProps {
  initialData?: Partial<Company>;
  onSave: (data: Partial<Company>) => Promise<void>;
  onCancel: () => void;
}

export function useCompanyForm({ initialData, onSave, onCancel }: UseCompanyFormProps) {
  console.log('[useCompanyForm] Initializing with data:', initialData);
  
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
    console.log('[useCompanyForm] Field change:', { field, value });
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleBlur = useCallback((field: keyof Company) => {
    console.log('[useCompanyForm] Field blur:', field);
    
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    const validation = validateField(field, formData[field]);
    console.log('[useCompanyForm] Field validation:', validation);

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
    console.log('[useCompanyForm] Address change:', { field, value });
    
    let formattedValue = value;
    if (field === 'cep') {
      formattedValue = maskCEP(value);
    }

    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address!,
        [field]: formattedValue
      }
    }));
  }, []);

  const handleAddressBlur = useCallback(async (field: keyof Company['address']) => {
    console.log('[useCompanyForm] Address field blur:', field);
    
    setTouchedFields(prev => ({ ...prev, [`address.${field}`]: true }));
    
    const validation = validateField(`address.${field}`, formData.address?.[field]);
    console.log('[useCompanyForm] Address field validation:', validation);

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
      console.log('[useCompanyForm] Searching CEP:', formData.address.cep);
      const address = await searchCep(formData.address.cep);
      
      if (address) {
        console.log('[useCompanyForm] Address found:', address);
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address!,
            ...address
          }
        }));
      } else {
        console.log('[useCompanyForm] CEP not found');
        setFormErrors(prev => ({
          ...prev,
          'address.cep': 'CEP não encontrado'
        }));
      }
    }
  }, [formData.address]);

  const validateForm = useCallback(() => {
    console.log('[useCompanyForm] Validating form data:', formData);
    
    const normalized = normalizeCompany(formData);
    console.log('[useCompanyForm] Normalized data:', normalized);
    
    const validation = validateCompany(normalized);
    console.log('[useCompanyForm] Validation result:', validation);

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
    console.log('[useCompanyForm] Form submission started');

    if (!validateForm()) {
      console.log('[useCompanyForm] Form validation failed');
      return;
    }

    const loadingKey = formData.id ? `edit-company-${formData.id}` : 'new-company';
    console.log('[useCompanyForm] Starting save operation:', { loadingKey });

    try {
      startLoading(loadingKey);
      const normalized = normalizeCompany(formData);
      console.log('[useCompanyForm] Saving normalized data:', normalized);
      
      await onSave(normalized);
      console.log('[useCompanyForm] Save successful');
    } catch (error) {
      console.error('[useCompanyForm] Save failed:', error);
      setFormErrors({ submit: 'Erro ao salvar empresa' });
    } finally {
      stopLoading(loadingKey);
    }
  }, [formData, validateForm, onSave, startLoading, stopLoading]);

  const handleCancel = useCallback(() => {
    console.log('[useCompanyForm] Cancelling form');
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