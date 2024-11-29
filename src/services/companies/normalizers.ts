import { Company, ContactField } from '@/types';

export function normalizeCompany(data: Partial<Company>): Partial<Company> {
  console.log('[CompanyNormalizer] Normalizing company data:', { input: data });

  const normalized = {
    ...data,
    name: data.name?.trim(),
    legalName: data.legalName?.trim() || '',
    cnpj: data.cnpj?.trim() || '',
    phones: normalizeContactFields(data.phones || []),
    emails: normalizeContactFields(data.emails || []),
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

  console.log('[CompanyNormalizer] Normalized result:', { output: normalized });
  return normalized;
}

function normalizeContactFields(fields: ContactField[]): ContactField[] {
  console.log('[CompanyNormalizer] Normalizing contact fields:', { input: fields });

  const normalized = fields.map(field => ({
    ...field,
    value: field.value.trim()
  }));

  console.log('[CompanyNormalizer] Normalized contact fields:', { output: normalized });
  return normalized;
}