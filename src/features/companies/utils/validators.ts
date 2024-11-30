import { Company } from '@/types';
import { validateCNPJ, validateEmail, validatePhone, validateCEP } from '@/utils/validators';

export function validateField(field: string, value: any): { isValid: boolean; error?: string } {
  // Required fields
  if (field === 'name' && (!value || !value.trim())) {
    return { isValid: false, error: 'Nome é obrigatório' };
  }

  // Optional fields with format validation
  if (value) {
    switch (field) {
      case 'cnpj':
        return {
          isValid: validateCNPJ(value),
          error: 'CNPJ inválido'
        };
      
      case 'website':
        const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}$/;
        return {
          isValid: urlPattern.test(value),
          error: 'Website inválido'
        };
      
      case 'address.cep':
        return {
          isValid: validateCEP(value),
          error: 'CEP inválido'
        };
    }
  }

  return { isValid: true };
}

export function validateCompany(data: Partial<Company>): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Required fields
  if (!data.name?.trim()) {
    errors.name = 'Nome é obrigatório';
  }

  // Optional fields with format validation
  if (data.cnpj && !validateCNPJ(data.cnpj)) {
    errors.cnpj = 'CNPJ inválido';
  }

  if (data.phones?.some(phone => !validatePhone(phone.value))) {
    errors.phones = 'Um ou mais telefones são inválidos';
  }

  if (data.emails?.some(email => !validateEmail(email.value))) {
    errors.emails = 'Um ou mais e-mails são inválidos';
  }

  if (data.website) {
    const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}$/;
    if (!urlPattern.test(data.website)) {
      errors.website = 'Website inválido';
    }
  }

  // Address validation
  if (data.address) {
    if (data.address.cep && !validateCEP(data.address.cep)) {
      errors['address.cep'] = 'CEP inválido';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}