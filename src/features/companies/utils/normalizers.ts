import { Company } from '@/types';

export function normalizeCompany(data: Partial<Company>): Partial<Company> {
  return {
    ...data,
    name: data.name?.trim(),
    legalName: data.legalName?.trim() || '',
    cnpj: data.cnpj?.trim() || '',
    phones: data.phones || [],
    emails: data.emails || [],
    website: data.website?.trim() || '',
    customFields: data.customFields || {},
    address: {
      cep: data.address?.cep || '',
      street: data.address?.street || '',
      number: data.address?.number || '',
      district: data.address?.district || '',
      city: data.address?.city || '',
      state: data.address?.state || '',
      complement: data.address?.complement || '',
      postalBox: data.address?.postalBox || ''
    }
  };
}