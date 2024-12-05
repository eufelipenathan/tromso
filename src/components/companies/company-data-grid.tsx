"use client";

import { Company } from "@prisma/client";
import { useCompanyColumns } from "./use-company-columns";
import { BaseDataGrid } from "@/components/shared/data-grid";

interface CompanyDataGridProps {
  companies: Company[];
  isLoading: boolean;
}

export function CompanyDataGrid({ companies, isLoading }: CompanyDataGridProps) {
  const columns = useCompanyColumns();

  const filterCompanies = (company: Company, searchText: string) => {
    return (
      company.name.toLowerCase().includes(searchText) ||
      (company.email?.toLowerCase().includes(searchText) ?? false) ||
      (company.phone?.toLowerCase().includes(searchText) ?? false) ||
      (company.website?.toLowerCase().includes(searchText) ?? false)
    );
  };

  return (
    <BaseDataGrid
      rows={companies}
      columns={columns}
      isLoading={isLoading}
      searchPlaceholder="Buscar empresas..."
      filterFn={filterCompanies}
    />
  );
}