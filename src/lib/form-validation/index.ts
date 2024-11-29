import { validateCNPJ, validateEmail, validatePhone, validateWebsite } from '@/utils/validators';
import { maskCNPJ, maskPhone } from '@/utils/masks';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FieldValidator {
  validate: (value: string) => ValidationResult;
  mask?: (value: string) => string;
}

export const fieldValidators: Record<string, FieldValidator> = {
  cnpj: {
    validate: (value) => ({
      isValid: !value || validateCNPJ(value),
      error: 'CNPJ inválido'
    }),
    mask: maskCNPJ
  },
  phone: {
    validate: (value) => ({
      isValid: !value || validatePhone(value),
      error: 'Telefone inválido'
    }),
    mask: maskPhone
  },
  email: {
    validate: (value) => ({
      isValid: !value || validateEmail(value),
      error: 'E-mail inválido'
    })
  },
  website: {
    validate: (value) => ({
      isValid: !value || validateWebsite(value),
      error: 'Website inválido'
    })
  }
};

export function getFieldValidator(fieldKey?: string): FieldValidator | undefined {
  if (!fieldKey) return undefined;
  return fieldValidators[fieldKey];
}

export function validateRequired(value: string): ValidationResult {
  return {
    isValid: Boolean(value.trim()),
    error: 'Campo obrigatório'
  };
}