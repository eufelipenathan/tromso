import { createTheme } from '@mui/material/styles';

export const gridTheme = createTheme({
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
          },
        },
        columnHeader: {
          backgroundColor: '#F9FAFB',
          color: '#374151',
          fontWeight: 600,
        },
        row: {
          '&:hover': {
            backgroundColor: '#F3F4F6',
          },
        },
      },
    },
  },
});