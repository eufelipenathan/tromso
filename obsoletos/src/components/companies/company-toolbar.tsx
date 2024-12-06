"use client";

import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarColumnsButton,
} from "@mui/x-data-grid";
import { TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface CompanyToolbarProps {
  onSearchChange: (value: string) => void;
}

export function CompanyToolbar({ onSearchChange }: CompanyToolbarProps) {
  return (
    <GridToolbarContainer
      sx={{
        p: 1,
        gap: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <TextField
        size="small"
        placeholder="Buscar empresas..."
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{
          width: 300,
          "& .MuiOutlinedInput-root": {
            backgroundColor: "background.paper",
            "& fieldset": {
              borderColor: "divider", // Borda padrão
            },
            "&:hover fieldset": {
              borderColor: "divider", // Borda no hover
            },
            "&.Mui-focused fieldset": {
              border: "none", // Remove a borda no foco
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none", // Garantia adicional para remover bordas residuais
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <GridToolbarFilterButton />
      <GridToolbarColumnsButton />
      <GridToolbarExport
        printOptions={{
          hideToolbar: true,
          hideFooter: true,
        }}
      />
    </GridToolbarContainer>
  );
}
