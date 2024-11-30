import React from 'react';
import { 
  DataGrid, 
  ptBR,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarExport,
  GridPrintGetRowsToExportParams,
} from '@mui/x-data-grid';
import { ThemeProvider } from '@mui/material/styles';
import { TextField, InputAdornment, IconButton, Menu, MenuItem } from '@mui/material';
import { Search, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { Company, ContactField } from '@/types';
import { formatDate } from '@/utils/dates';
import { gridTheme } from '@/components/grid/theme';
import { Popover } from '@mui/material';

// Action Menu Component
const ActionMenu = ({ company, onEdit, onDelete }: {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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
        <MoreVertical />
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

// List Popover Component
const ListPopover = ({ 
  items = [], 
  maxVisible = 1,
  title = 'Itens',
  truncateAt = 17,
  wrapLongText = false
}: {
  items: ContactField[];
  maxVisible?: number;
  title?: string;
  truncateAt?: number;
  wrapLongText?: boolean;
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  if (!items?.length) return <>-</>;

  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;
  const showMore = remainingCount > 0;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const truncateText = (text: string) => {
    if (!truncateAt) return text;
    return text.length > truncateAt 
      ? `${text.substring(0, truncateAt)}...` 
      : text;
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div 
        className="cursor-pointer text-gray-900 hover:text-gray-700"
        onClick={handleClick}
      >
        {truncateText(visibleItems[0].value)}
        {showMore && (
          <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
            +{remainingCount}
          </span>
        )}
      </div>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 max-w-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>
          <div className="space-y-1">
            {items.map((item, index) => (
              <div 
                key={item.id || index}
                className={`text-sm text-gray-600 ${wrapLongText ? 'break-words' : ''}`}
              >
                {item.value}
              </div>
            ))}
          </div>
        </div>
      </Popover>
    </div>
  );
};

// Toolbar Component
const CustomToolbar = () => {
  const getFormattedDate = () => {
    return format(new Date(), 'yyyy-MM-dd_HH-mm');
  };

  const getFilename = (type: 'csv' | 'print') => {
    return `empresas_${getFormattedDate()}.${type === 'csv' ? 'csv' : 'pdf'}`;
  };

  const handlePrint = (params: GridPrintGetRowsToExportParams) => {
    const totalColumns = params.fields.length;
    const isLandscape = totalColumns > 5;
    
    return {
      orientation: isLandscape ? 'landscape' : 'portrait',
      pageSize: 'A4'
    };
  };

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex-1 max-w-md">
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          placeholder="Pesquisar..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search className="h-5 w-5 text-gray-400" />
              </InputAdornment>
            ),
          }}
        />
      </div>
      <GridToolbarContainer>
        <GridToolbarFilterButton />
        <GridToolbarColumnsButton />
        <GridToolbarExport 
          printOptions={{ 
            hideToolbar: true,
            hideFooter: true,
            getRowsToExport: handlePrint,
            fileName: getFilename('print')
          }}
          csvOptions={{
            fileName: getFilename('csv')
          }}
        />
      </GridToolbarContainer>
    </div>
  );
};

// Column Definitions
const getCompanyColumns = (
  onEdit: (company: Company) => void,
  onDelete: (company: Company) => void
): GridColDef[] => [
  {
    field: 'actions',
    headerName: '',
    width: 45,
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
    width: 300,
    minWidth: 200,
  },
  {
    field: 'legalName',
    headerName: 'Razão Social',
    width: 300,
    minWidth: 200,
  },
  {
    field: 'cnpj',
    headerName: 'CNPJ',
    width: 180,
    minWidth: 180,
  },
  {
    field: 'phones',
    headerName: 'Telefones',
    width: 180,
    minWidth: 180,
    renderCell: (params) => (
      <ListPopover items={params.value} maxVisible={1} title="Telefones" />
    ),
  },
  {
    field: 'emails',
    headerName: 'E-mails',
    width: 200,
    minWidth: 200,
    renderCell: (params) => (
      <ListPopover 
        items={params.value} 
        maxVisible={1} 
        title="E-mails"
        truncateAt={17}
        wrapLongText
      />
    ),
  },
  {
    field: 'createdAt',
    headerName: 'Criado em',
    width: 180,
    minWidth: 180,
    valueFormatter: (params) => formatDate(params.value),
  },
];

// Main Component
interface CompanyListProps {
  companies: Company[];
  preferences?: any;
  onPreferencesChange?: (prefs: any) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function CompanyList({
  companies,
  onEdit,
  onDelete
}: CompanyListProps) {
  const columns = getCompanyColumns(onEdit, onDelete);

  return (
    <ThemeProvider theme={gridTheme}>
      <div className="h-[600px] w-full bg-white">
        <DataGrid
          rows={companies}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
          }}
          slots={{
            toolbar: CustomToolbar,
          }}
          pageSizeOptions={[10, 25, 50]}
          checkboxSelection={false}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </div>
    </ThemeProvider>
  );
}