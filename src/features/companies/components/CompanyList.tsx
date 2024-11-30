import React, { useMemo, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridOptions } from 'ag-grid-community';
import { Company, ContactField } from '@/types';
import { formatDate } from '@/utils/dates';
import { ActionsRenderer } from "./grid/ActionsRenderer";
import Button from '@/components/Button';
import { Search } from 'lucide-react';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';

interface CompanyListProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function CompanyList({ companies, onEdit, onDelete }: CompanyListProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [quickFilterText, setQuickFilterText] = useState('');

  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: '',
      field: 'actions',
      cellRenderer: ActionCellRenderer,
      cellRendererParams: {
        onEdit,
        onDelete,
      },
      width: 45,
      minWidth: 45,
      maxWidth: 45,
      pinned: 'left',
      sortable: false,
      filter: false,
      resizable: false,
    },
    {
      headerName: 'Nome',
      field: 'name',
      minWidth: 300,
      flex: 1,
    },
    {
      headerName: 'Razão Social',
      field: 'legalName',
      minWidth: 300,
      flex: 1,
    },
    {
      headerName: 'CNPJ',
      field: 'cnpj',
      width: 180,
    },
    {
      headerName: 'Telefones',
      field: 'phones',
      valueFormatter: (params) => {
        const phones = params.value as ContactField[];
        return phones.map((p) => p.value).join(', ') || '-';
      },
      width: 200,
    },
    {
      headerName: 'E-mails',
      field: 'emails',
      valueFormatter: (params) => {
        const emails = params.value as ContactField[];
        return emails.map((e) => e.value).join(', ') || '-';
      },
      width: 250,
    },
    {
      headerName: 'Criado em',
      field: 'createdAt',
      valueFormatter: (params) => formatDate(params.value),
      width: 180,
    },
  ], [onEdit, onDelete]);

  const gridOptions: GridOptions = useMemo(() => ({
    localeText: {
      page: 'Página',
      more: 'Mais',
      to: 'até',
      of: 'de',
      next: 'Próximo',
      last: 'Último',
      first: 'Primeiro',
      previous: 'Anterior',
      loadingOoo: 'Carregando...',
      pageSize: 'Tamanho da página',
    },
  }), []);

  const onQuickFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuickFilterText(e.target.value);
    gridRef.current?.api.setQuickFilter(e.target.value);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={quickFilterText}
            onChange={onQuickFilterChange}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="ag-theme-alpine w-full h-[600px]">
        <AgGridReact
          ref={gridRef}
          rowData={companies}
          columnDefs={columnDefs}
          gridOptions={gridOptions}
          animateRows={true}
          rowSelection="single"
          pagination={true}
          paginationPageSize={25}
        />
      </div>
    </div>
  );
}
