import { GridColDef } from '@mui/x-data-grid';
import { Contact, Company } from '@/types';
import { formatDate } from '@/utils/dates';
import ListPopover from '@/components/grid/ListPopover';
import Button from '@/components/Button';
import { Pencil, Trash2 } from 'lucide-react';

export const getContactColumns = (
  companies: Company[],
  onEdit: (contact: Contact) => void,
  onDelete: (contact: Contact) => void
): GridColDef[] => [
  {
    field: 'actions',
    headerName: 'Ações',
    width: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(params.row)}
          className="p-2"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(params.row)}
          className="p-2"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
  {
    field: 'name',
    headerName: 'Nome',
    flex: 1,
    minWidth: 200,
  },
  {
    field: 'companyId',
    headerName: 'Empresa',
    flex: 1,
    minWidth: 200,
    valueGetter: (params) => {
      const company = companies.find(c => c.id === params.value);
      return company?.name || '-';
    },
  },
  {
    field: 'phones',
    headerName: 'Telefones',
    flex: 1,
    minWidth: 200,
    renderCell: (params) => (
      <ListPopover items={params.value} maxVisible={1} title="Telefones" />
    ),
  },
  {
    field: 'emails',
    headerName: 'E-mails',
    flex: 1,
    minWidth: 200,
    renderCell: (params) => (
      <ListPopover items={params.value} maxVisible={1} title="E-mails" />
    ),
  },
  {
    field: 'createdAt',
    headerName: 'Criado em',
    width: 180,
    valueFormatter: (params) => formatDate(params.value),
  },
];