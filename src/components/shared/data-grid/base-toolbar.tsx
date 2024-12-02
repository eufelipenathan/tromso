"use client";

import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarColumnsButton,
} from "@mui/x-data-grid";
import { TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface BaseToolbarProps {
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
}

export function BaseToolbar({ onSearchChange, searchPlaceholder }: BaseToolbarProps) {
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
        placeholder={searchPlaceholder}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{
          width: 300,
          "& .MuiOutlinedInput-root": {
            backgroundColor: "background.paper",
            "& fieldset": {
              borderColor: "divider",
            },
            "&:hover fieldset": {
              borderColor: "divider",
            },
            "&.Mui-focused fieldset": {
              border: "none",
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
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