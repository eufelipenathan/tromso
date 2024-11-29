import { Company } from '@/types';
import { EntityManagementConfig } from '../types';
import { formatWebsite } from '@/utils/validators';

export const companyConfig: EntityManagementConfig<Company> = {
  collectionName: 'companies',
  
  baseFields: [
    {
      key: 'name',
      label: 'Nome',
      type: 'text',
      required: true,
      section: 'Informações Básicas'
    },
    {
      key: 'legalName',
      label: 'Razão Social',
      type: 'text',
      section: 'Informações Básicas'
    },
    {
      key: 'cnpj',
      label: 'CNPJ',
      type: 'text',
      section: 'Informações Básicas'
    },
    {
      key: 'phones',
      label: 'Telefone',
      type: 'array',
      section: 'Informações Básicas',
      format: (value: any[], index: number) => ({
        label: `Telefone ${index + 1}`,
        value: value[index]?.value || ''
      })
    },
    {
      key: 'emails',
      label: 'E-mail',
      type: 'array',
      section: 'Informações Básicas',
      format: (value: any[], index: number) => ({
        label: `E-mail ${index + 1}`,
        value: value[index]?.value || ''
      })
    },
    {
      key: 'website',
      label: 'Website',
      type: 'text',
      section: 'Informações Básicas'
    }
  ],
  
  generateSearchTokens: (company: Partial<Company>) => {
    const searchTokens = new Set<string>();
    const name = company.name?.toLowerCase().trim() || '';
    const words = name.split(' ').filter(word => word.length > 0);

    words.forEach(word => searchTokens.add(word));
    if (name.length <= 1500) searchTokens.add(name);

    // Add phone numbers and emails to search tokens
    company.phones?.forEach(phone => {
      searchTokens.add(phone.value.replace(/\D/g, ''));
    });

    company.emails?.forEach(email => {
      searchTokens.add(email.value.toLowerCase());
    });

    return Array.from(searchTokens);
  },

  validateEntity: (company: Partial<Company>) => {
    return Boolean(company.name?.trim());
  },

  formatEntity: (data: Partial<Company>) => {
    const cleanWebsite = data.website?.trim();
    const formattedWebsite = cleanWebsite ? formatWebsite(cleanWebsite) : null;

    return {
      name: data.name?.trim() || '',
      legalName: data.legalName?.trim() || '',
      cnpj: data.cnpj || '',
      phones: data.phones || [],
      emails: data.emails || [],
      website: formattedWebsite || null,
      address: {
        cep: data.address?.cep || '',
        street: data.address?.street || '',
        number: data.address?.number || '',
        complement: data.address?.complement || '',
        district: data.address?.district || '',
        postalBox: data.address?.postalBox || '',
        state: data.address?.state || '',
        city: data.address?.city || '',
      },
      customFields: data.customFields || {}
    };
  }
};