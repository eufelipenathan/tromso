"use client";

import { CompanyDataGrid } from "./company-data-grid";
import { useCompanies } from "@/hooks/use-companies";

export function CompanyTable() {
  const { companies, isLoading, error } = useCompanies();

  if (error) {
    return (
      <div className="rounded-lg border bg-destructive/10">
        <div className="p-8 text-center text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return <CompanyDataGrid companies={companies} isLoading={isLoading} />;
}