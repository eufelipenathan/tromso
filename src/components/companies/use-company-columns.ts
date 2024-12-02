"use client";

import { formatDate, formatPhone } from "@/lib/utils";
import Link from "next/link";

export function useCompanyColumns() {
  return [
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
      renderCell: (params: any) => (
        <Link
          href={`/empresas/${params.row.id}`}
          className="text-primary hover:underline"
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      renderCell: (params: any) => 
        params.value ? (
          <a
            href={`mailto:${params.value}`}
            className="text-primary hover:underline"
          >
            {params.value}
          </a>
        ) : (
          "-"
        ),
    },
    {
      field: 'phone',
      headerName: 'Telefone',
      flex: 1,
      valueFormatter: (params: any) =>
        params.value ? formatPhone(params.value) : "-",
    },
    {
      field: 'website',
      headerName: 'Website',
      flex: 1,
      renderCell: (params: any) =>
        params.value ? (
          <a
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {params.value}
          </a>
        ) : (
          "-"
        ),
    },
    {
      field: 'createdAt',
      headerName: 'Cadastro',
      flex: 1,
      valueFormatter: (params: any) => formatDate(params.value),
    },
  ];
}