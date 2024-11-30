import React, { useState } from 'react';
import { 
  DataGrid, 
  GridToolbar,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { ThemeProvider } from '@mui/material/styles';
import { TextField, InputAdornment } from '@mui/material';
import { Search } from 'lucide-react';
import { Contact, Company } from '@/types';
import { getContactColumns } from './columns';
import { gridTheme } from '@/components/grid/theme';

interface ContactListProps {
  contacts: Contact[];
  companies: Company[];
  preferences?: any;
  onPreferencesChange?: (prefs: any) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

function CustomToolbar() {
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
          }}
        />
      </GridToolbarContainer>
    </div>
  );
}

export function ContactList({
  contacts,
  companies,
  onEdit,
  onDelete
}: ContactListProps) {
  const columns = getContactColumns(companies, onEdit, onDelete);

  return (
    <ThemeProvider theme={gridTheme}>
      <div className="h-[600px] w-full bg-white">
        <DataGrid
          rows={contacts}
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
        />
      </div>
    </ThemeProvider>
  );
}