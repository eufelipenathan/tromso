"use client";

import { formatDate, formatPhone } from "@/lib/utils";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { ContactActions } from "./contact-actions";

export function useContactColumns(): GridColDef[] {
  return [
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      hideable: false,
      renderCell: (params: GridRenderCellParams) => <ContactActions {...params} />,
    },
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Link
          href={`/contatos/${params.row.id}`}
          className="text-primary hover:underline"
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: 'company',
      headerName: 'Empresa',
      flex: 1,
      valueGetter: (params) => params.row.company.name,
      renderCell: (params: GridRenderCellParams) => (
        <Link
          href={`/empresas/${params.row.company.id}`}
          className="text-primary hover:underline"
        >
          {params.row.company.name}
        </Link>
      ),
    },
    {
      field: 'position',
      headerName: 'Cargo',
      flex: 1,
      valueFormatter: (params) => params.value || "-",
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
      field: 'createdAt',
      headerName: 'Cadastro',
      flex: 1,
      valueFormatter: (params) => formatDate(params.value),
    },
  ];
}