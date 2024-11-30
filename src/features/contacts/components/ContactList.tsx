import React, { useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider } from '@mui/material/styles';
import { Contact, Company } from '@/types';
import { getContactColumns } from './columns';
import { gridTheme } from '@/components/grid/theme';
import { SearchField } from '@/components/grid';

interface ContactListProps {
  contacts: Contact[];
  companies: Company[];
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactList({ contacts, companies, onEdit, onDelete }: ContactListProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [quickFilterText, setQuickFilterText] = useState('');

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      headerName: '',
      field: 'actions',
      cellRenderer: ActionsRenderer,
      cellRendererParams: {
        onEdit,
        onDelete,
      },
      width: 48,
      minWidth: 48,
      maxWidth: 48,
      pinned: 'left',
      sortable: false,
      filter: false,
      resizable: false,
      suppressMenu: true,
      cellClass: 'ag-cell-no-focus',
    },
    {
      headerName: 'Nome',
      field: 'name',
      minWidth: 300,
      flex: 1,
    },
    {
      headerName: 'Empresa',
      field: 'companyId',
      valueFormatter: (params) => {
        const company = companies.find(c => c.id === params.value);
        return company?.name || '-';
      },
      minWidth: 300,
      flex: 1,
    },
    {
      headerName: 'Telefones',
      field: 'phones',
      minWidth: 180,
      width: 180,
      cellRenderer: ContactFieldRenderer,
    },
    {
      headerName: 'E-mails',
      field: 'emails',
      minWidth: 200,
      flex: 1,
      cellRenderer: ContactFieldRenderer,
    },
    {
      headerName: 'Criado em',
      field: 'createdAt',
      valueFormatter: (params) => formatDate(params.value),
      minWidth: 180,
      width: 180,
    },
  ], [companies, onEdit, onDelete]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

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
      selectAll: 'Selecionar todos',
      searchOoo: 'Pesquisar...',
      filterOoo: 'Filtrar...',
      equals: 'Igual a',
      notEqual: 'Diferente de',
      contains: 'Contém',
      notContains: 'Não contém',
      startsWith: 'Começa com',
      endsWith: 'Termina com',
    },
    suppressClickEdit: true,
    suppressCellFocus: true,
    rowHeight: 48,
    headerHeight: 48,
    rowClass: 'cursor-pointer',
  }), []);

  const onFilterTextBoxChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuickFilterText(e.target.value);
    gridRef.current?.api?.setQuickFilter(e.target.value);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={quickFilterText}
            onChange={onFilterTextBoxChanged}
            placeholder="Pesquisar..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="ag-theme-alpine w-full h-[600px]">
        <AgGridReact
          ref={gridRef}
          rowData={contacts}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
          animateRows={true}
          rowSelection="single"
          enableCellTextSelection={true}
          pagination={true}
          paginationPageSize={25}
          suppressPaginationPanel={false}
        />
      </div>
    </div>
  );
}