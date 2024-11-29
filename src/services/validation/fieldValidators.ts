import { FieldValidator } from './types';
import { validateEmail, validatePhone, validateCNPJ, validateCEP, validateWebsite } from './validators';
import { maskCNPJ, maskPhone, maskCEP } from './masks';
import { formatCurrency, formatWebsite } from './formatters';

export const fieldValidators: Record<string, FieldValidator> = {
  email: {
    validate: (value) => ({
      isValid: !value || validateEmail(value),
      error: 'E-mail inválido'
    })
  },

  phone: {
    validate: (value) => ({
      isValid: !value || validatePhone(value),
      error: 'Telefone inválido'
    }),
    mask: maskPhone
  },

  cnpj: {
    validate: (value) => ({
      isValid: !value || validateCNPJ(value),
      error: 'CNPJ inválido'
    }),
    mask: maskCNPJ
  },

  cep: {
    validate: (value) => ({
      isValid: !value || validateCEP(value),
      error: 'CEP inválido'
    }),
    mask: maskCEP
  },

  website: {
    validate: (value) => ({
      isValid: !value || validateWebsite(value),
      error: 'Website inválido'
    }),
    format: formatWebsite
  },

  currency: {
    validate: (value) => ({
      isValid: !isNaN(Number(value)),
      error: 'Valor inválido'
    }),
    format: formatCurrency
  }
};