import { CompanyList } from "@/components/companies/company-list";

export default function CompaniesPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Empresas
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Gerencie todas as empresas cadastradas no sistema
        </p>
      </div>
      <CompanyList />
    </div>
  );
}