import { GridColDef } from '@mui/x-data-grid';
import { Company } from '@/types';
import { formatDate } from '@/utils/dates';
import ListPopover from '@/components/grid/ListPopover';
import { MoreVert } from '@mui/icons-material';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';

const ActionMenu = ({ company, onEdit, onDelete }: {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit(company);
    handleClose();
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(company);
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small">
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>Editar</MenuItem>
        <MenuItem onClick={handleDelete} className="text-red-600">
          Excluir
        </MenuItem>
      </Menu>
    </>
  );
};

export const getCompanyColumns = (
  onEdit: (company: Company) => void,
  onDelete: (company: Company) => void
): GridColDef[] => [
  {
    field: 'actions',
    headerName: '',
    width: 50,
    sortable: false,
    filterable: false,
    hideable: false,
    disableColumnMenu: true,
    disableReorder: true,
    renderCell: (params) => (
      <ActionMenu 
        company={params.row} 
        onEdit={onEdit} 
        onDelete={onDelete}
      />
    ),
  },
  {
    field: 'name',
    headerName: 'Nome',
    flex: 1,
    minWidth: 200,
  },
  {
    field: 'legalName',
    headerName: 'Razão Social',
    flex: 1,
    minWidth: 200,
  },
  {
    field: 'cnpj',
    headerName: 'CNPJ',
    width: 150,
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
    renderCell: (params) => {
      const emails = params.value || [];
      const firstEmail = emails[0]?.value || '';
      const remainingCount = emails.length - 1;
      const truncatedEmail = firstEmail.length > 17 
        ? `${firstEmail.substring(0, 17)}...` 
        : firstEmail;

      return (
        <ListPopover 
          items={params.value} 
          maxVisible={1} 
          title="E-mails"
          truncateAt={17}
          wrapLongText
        />
      );
    },
  },
  {
    field: 'createdAt',
    headerName: 'Criado em',
    width: 180,
    valueFormatter: (params) => formatDate(params.value),
  },
];