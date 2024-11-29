import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function normalizeDate(date: Date | Timestamp | null | undefined): Date | null {
  if (!date) return null;
  
  // If it's a Firestore Timestamp
  if ('toDate' in date) {
    return date.toDate();
  }
  
  // If it's already a Date
  if (date instanceof Date) {
    return date;
  }
  
  return null;
}

export function formatDate(date: Date | Timestamp | null | undefined, pattern = 'dd/MM/yyyy HH:mm'): string {
  const normalized = normalizeDate(date);
  if (!normalized) return '-';
  
  return format(normalized, pattern, { locale: ptBR });
}

export function formatDateTime(date: Date | Timestamp | null | undefined): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
}