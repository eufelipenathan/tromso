import React from 'react';
import { Company } from '@/types';
import { GridColumn } from '@/types/grid';
import AdvancedGrid from '@/components/grid/AdvancedGrid';
import ListPopover from '@/components/grid/ListPopover';
import { formatDate } from '@/utils/dates';

interface CompanyListProps {
  companies: Company[];
  preferences?: any;
  onPreferencesChange?: (prefs: any) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function CompanyList({
  companies,
  preferences,
  onPreferencesChange,
  onEdit,
  onDelete
}: CompanyListProps) {
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
      key: 'legalName',
      label: 'Razão Social',
      type: 'text',
      sortable: true,
      filterable: true,
      section: 'Informações Básicas'
    },
    {
      key: 'cnpj',
      label: 'CNPJ',
      type: 'text',
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
      key: 'website',
      label: 'Website',
      type: 'text',
      sortable: true,
      filterable: true,
      section: 'Informações Básicas'
    },
    {
      key: 'address.cep',
      label: 'CEP',
      type: 'text',
      sortable: true,
      filterable: true,
      section: 'Endereço'
    },
    {
      key: 'address.street',
      label: 'Endereço',
      type: 'text',
      sortable: true,
      filterable: true,
      section: 'Endereço'
    },
    {
      key: 'address.number',
      label: 'Número',
      type: 'text',
      sortable: true,
      filterable: true,
      section: 'Endereço'
    },
    {
      key: 'address.district',
      label: 'Bairro',
      type: 'text',
      sortable: true,
      filterable: true,
      section: 'Endereço'
    },
    {
      key: 'address.city',
      label: 'Cidade',
      type: 'text',
      sortable: true,
      filterable: true,
      section: 'Endereço'
    },
    {
      key: 'address.state',
      label: 'Estado',
      type: 'text',
      sortable: true,
      filterable: true,
      section: 'Endereço'
    },
    {
      key: 'createdAt',
      label: 'Criado em',
      type: 'date',
      format: (value) => formatDate(value),
      sortable: true,
      filterable: false,
      section: 'Informações Básicas'
    },
    {
      key: 'updatedAt',
      label: 'Atualizado em',
      type: 'date',
      format: (value) => formatDate(value),
      sortable: true,
      filterable: false,
      section: 'Informações Básicas'
    }
  ];

  // Filtra empresas não deletadas
  const activeCompanies = companies.filter(company => !company.isDeleted);

  return (
    <AdvancedGrid
      columns={columns}
      data={activeCompanies}
      preferences={preferences}
      onPreferencesChange={onPreferencesChange}
      onEdit={onEdit}
      onDelete={onDelete}
      loading={false}
    />
  );
}