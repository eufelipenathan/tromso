import React from 'react';
import { Contact } from '@/types';
import { GridColumn } from '@/types/grid';
import AdvancedGrid from '@/components/grid/AdvancedGrid';
import ListPopover from '@/components/grid/ListPopover';
import { formatDate } from '@/utils/dates';

interface ContactListProps {
  contacts: Contact[];
  companies: any[];
  preferences?: any;
  onPreferencesChange?: (prefs: any) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactList({
  contacts,
  companies,
  preferences,
  onPreferencesChange,
  onEdit,
  onDelete
}: ContactListProps) {
  const columns: GridColumn[] = [
    {
      key: 'name',
      label: 'Nome',
      type: 'text',
      sortable: true,
      filterable: true,
      section: 'Informações Básicas'
    },
    {
      key: 'companyId',
      label: 'Empresa',
      type: 'text',
      format: (companyId: string) => companies.find(c => c.id === companyId)?.name || '-',
      sortable: true,
      filterable: true,
      section: 'Informações Básicas'
    },
    {
      key: 'phones',
      label: 'Telefones',
      type: 'array',
      format: (phones: string[]) => (
        <ListPopover items={phones} maxVisible={1} title="Telefones" />
      ),
      sortable: false,
      filterable: true,
      section: 'Informações Básicas'
    },
    {
      key: 'emails',
      label: 'E-mails',
      type: 'array',
      format: (emails: string[]) => (
        <ListPopover items={emails} maxVisible={1} title="E-mails" />
      ),
      sortable: false,
      filterable: true,
      section: 'Informações Básicas'
    },
    {
      key: 'createdAt',
      label: 'Criado em',
      type: 'date',
      format: (value) => formatDate(value),
      sortable: true,
      filterable: false,
      section: 'Informações Básicas'
    }
  ];

  return (
    <AdvancedGrid
      columns={columns}
      data={contacts}
      preferences={preferences}
      onPreferencesChange={onPreferencesChange}
      onEdit={onEdit}
      onDelete={onDelete}
      loading={false}
    />
  );
}