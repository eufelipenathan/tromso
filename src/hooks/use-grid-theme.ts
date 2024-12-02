"use client";

import { createTheme } from '@mui/material/styles';
import { ptBR } from '@mui/x-data-grid';
import { useTheme } from "next-themes";

export function useGridTheme() {
  const { theme: applicationTheme } = useTheme();

  return createTheme(
    {
      palette: {
        mode: applicationTheme === 'dark' ? 'dark' : 'light',
      },
    },
    ptBR
  );
}