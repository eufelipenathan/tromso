"use client";

import { useState, useCallback } from "react";
import { DataGrid, ptBR, GridColDef } from '@mui/x-data-grid';
import { ThemeProvider } from '@mui/material/styles';
import { useGridTheme } from "./use-grid-theme";
import { BaseToolbar } from "./base-toolbar";

interface BaseDataGridProps {
  rows: any[];
  columns: GridColDef[];
  isLoading: boolean;
  searchPlaceholder: string;
  filterFn: (row: any, searchText: string) => boolean;
}

export function BaseDataGrid({ 
  rows, 
  columns, 
  isLoading,
  searchPlaceholder,
  filterFn 
}: BaseDataGridProps) {
  const theme = useGridTheme();
  const [searchText, setSearchText] = useState("");

  const filteredRows = rows.filter((row) => filterFn(row, searchText.toLowerCase()));

  const handleSearchChange = useCallback((value: string) => {
    setSearchText(value);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          density="compact"
          slots={{
            toolbar: BaseToolbar,
          }}
          slotProps={{
            toolbar: {
              onSearchChange: handleSearchChange,
              searchPlaceholder,
            },
          }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          disableColumnFilter={false}
          disableColumnSelector={false}
          disableDensitySelector={false}
        />
      </div>
    </ThemeProvider>
  );
}