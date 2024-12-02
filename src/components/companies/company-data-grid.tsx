"use client";

import { useState, useCallback } from "react";
import { Company } from "@prisma/client";
import { DataGrid, ptBR } from '@mui/x-data-grid';
import { ThemeProvider } from '@mui/material/styles';
import { useGridTheme } from "@/hooks/use-grid-theme";
import { useCompanyColumns } from "./use-company-columns";
import { CompanyToolbar } from "./company-toolbar";

interface CompanyDataGridProps {
  companies: Company[];
  isLoading: boolean;
}

export function CompanyDataGrid({ companies, isLoading }: CompanyDataGridProps) {
  const theme = useGridTheme();
  const columns = useCompanyColumns();
  const [searchText, setSearchText] = useState("");

  const filteredCompanies = companies.filter((company) => {
    const searchLower = searchText.toLowerCase();
    return (
      company.name.toLowerCase().includes(searchLower) ||
      (company.email?.toLowerCase().includes(searchLower) ?? false) ||
      (company.phone?.toLowerCase().includes(searchLower) ?? false) ||
      (company.website?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearchText(value);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredCompanies}
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
            toolbar: CompanyToolbar,
          }}
          slotProps={{
            toolbar: {
              onSearchChange: handleSearchChange,
            },
          }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          disableColumnFilter={false}
          disableColumnSelector={false}
          disableDensitySelector={false}
          components={{
            Toolbar: CompanyToolbar,
          }}
        />
      </div>
    </ThemeProvider>
  );
}