import { Contact } from '@/types';
import { EntityManagementConfig } from '../types';

export const contactConfig: EntityManagementConfig<Contact> = {
  collectionName: 'contacts',
  
  baseFields: [
    {
      key: 'name',
      label: 'Nome',
      type: 'text',
      required: true,
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
    }
  ],
  
  generateSearchTokens: (contact: Partial<Contact>) => {
    const searchTokens = new Set<string>();
    const name = contact.name?.toLowerCase().trim() || '';
    const words = name.split(' ').filter(word => word.length > 0);

    words.forEach(word => searchTokens.add(word));
    if (name.length <= 1500) searchTokens.add(name);

    // Add phone numbers and emails to search tokens
    contact.phones?.forEach(phone => {
      searchTokens.add(phone.value.replace(/\D/g, ''));
    });

    contact.emails?.forEach(email => {
      searchTokens.add(email.value.toLowerCase());
    });

    return Array.from(searchTokens);
  },

  validateEntity: (contact: Partial<Contact>) => {
    return Boolean(contact.name?.trim() && contact.companyId);
  },

  formatEntity: (data: Partial<Contact>) => {
    return {
      name: data.name?.trim() || '',
      companyId: data.companyId || '',
      phones: data.phones || [],
      emails: data.emails || [],
      customFields: data.customFields || {}
    };
  }
};