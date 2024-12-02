"use client";

import { formatDate, formatPhone } from "@/lib/utils";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { CompanyActions } from "./company-actions";

export function useCompanyColumns(): GridColDef[] {
  return [
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      hideable: false,
      renderCell: (params: GridRenderCellParams) => <CompanyActions {...params} />,
    },
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Link
            href={`/empresas/${params.row.id}`}
            className="text-primary hover:underline"
          >
            {params.value}
          </Link>
        );
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return "-";
        return (
          <a
            href={`mailto:${params.value}`}
            className="text-primary hover:underline"
          >
            {params.value}
          </a>
        );
      },
    },
    {
      field: 'phone',
      headerName: 'Telefone',
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return "-";
        return formatPhone(params.value);
      },
    },
    {
      field: 'website',
      headerName: 'Website',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return "-";
        return (
          <a
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {params.value}
          </a>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Cadastro',
      flex: 1,
      valueFormatter: (params) => formatDate(params.value),
    },
  ];
}