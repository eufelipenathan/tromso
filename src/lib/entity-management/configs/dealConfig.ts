import { Deal } from '@/types/pipeline';
import { EntityManagementConfig } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dealConfig: EntityManagementConfig<Deal> = {
  collectionName: 'deals',
  
  baseFields: [
    {
      key: 'title',
      label: 'Título',
      type: 'text',
      required: true,
      section: 'Informações Básicas'
    },
    {
      key: 'value',
      label: 'Valor',
      type: 'currency',
      required: true,
      section: 'Informações Básicas',
      format: (value) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    },
    {
      key: 'createdAt',
      label: 'Data de Criação',
      type: 'date',
      section: 'Informações Básicas',
      format: (value) => format(value.toDate(), 'dd/MM/yyyy', { locale: ptBR })
    }
  ],

  generateSearchTokens: (deal: Partial<Deal>) => {
    const searchTokens = new Set<string>();
    const title = deal.title?.toLowerCase().trim() || '';
    searchTokens.add(title);
    return Array.from(searchTokens);
  },

  validateEntity: (deal: Partial<Deal>) => {
    return Boolean(
      deal.title?.trim() &&
      deal.value &&
      deal.value > 0 &&
      deal.stageId
    );
  },

  formatEntity: (data: Partial<Deal>) => {
    return {
      title: data.title?.trim() || '',
      value: data.value || 0,
      stageId: data.stageId || '',
      pipelineId: data.pipelineId || '',
      companyId: data.companyId || '',
      contactId: data.contactId,
      status: data.status || 'open',
      customFields: data.customFields || {}
    };
  }
};