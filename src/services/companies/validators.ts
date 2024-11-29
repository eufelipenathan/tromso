import { Company } from '@/types';
import { validateCNPJ, validateEmail, validatePhone } from '@/utils/validators';

export function validateCompany(data: Partial<Company>): { isValid: boolean; errors: string[] } {
  console.log('[CompanyValidator] Validating company data:', { data });

  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Nome é obrigatório');
  }

  if (data.cnpj && !validateCNPJ(data.cnpj)) {
    errors.push('CNPJ inválido');
  }

  if (data.phones?.some(phone => !validatePhone(phone.value))) {
    errors.push('Um ou mais telefones são inválidos');
  }

  if (data.emails?.some(email => !validateEmail(email.value))) {
    errors.push('Um ou mais e-mails são inválidos');
  }

  const result = {
    isValid: errors.length === 0,
    errors
  };

  console.log('[CompanyValidator] Validation result:', result);
  return result;
}