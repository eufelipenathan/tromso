import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: Date | string): string => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return format(parsedDate, 'dd/MM/yyyy', { locale: ptBR });
};

export const formatDateTime = (date: Date | string): string => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return format(parsedDate, 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatWebsite = (url: string): string => {
  if (!url) return '';
  
  let formattedUrl = url.trim().toLowerCase();
  
  if (!formattedUrl.match(/^https?:\/\//)) {
    formattedUrl = formattedUrl.startsWith('www.')
      ? `https://${formattedUrl}`
      : `https://www.${formattedUrl}`;
  } else if (!formattedUrl.includes('www.')) {
    formattedUrl = formattedUrl.replace(/^(https?:\/\/)/, '$1www.');
  }
  
  return formattedUrl;
};