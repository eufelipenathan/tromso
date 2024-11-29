import { ValidationRule } from './types';
import { validateRequired, validateEmail, validatePhone, validateCNPJ, validateCEP, validateWebsite } from './validators';

export const rules = {
  required: (message = 'Campo obrigatório'): ValidationRule => ({
    validate: (value) => ({
      isValid: validateRequired(value),
      error: message
    }),
    message
  }),

  email: (message = 'E-mail inválido'): ValidationRule<string> => ({
    validate: (value) => ({
      isValid: !value || validateEmail(value),
      error: message
    }),
    message
  }),

  phone: (message = 'Telefone inválido'): ValidationRule<string> => ({
    validate: (value) => ({
      isValid: !value || validatePhone(value),
      error: message
    }),
    message
  }),

  cnpj: (message = 'CNPJ inválido'): ValidationRule<string> => ({
    validate: (value) => ({
      isValid: !value || validateCNPJ(value),
      error: message
    }),
    message
  }),

  cep: (message = 'CEP inválido'): ValidationRule<string> => ({
    validate: (value) => ({
      isValid: !value || validateCEP(value),
      error: message
    }),
    message
  }),

  website: (message = 'Website inválido'): ValidationRule<string> => ({
    validate: (value) => ({
      isValid: !value || validateWebsite(value),
      error: message
    }),
    message
  })
};