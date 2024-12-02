"use client";

import { Contact, Company } from "@prisma/client";
import { useContactColumns } from "./use-contact-columns";
import { BaseDataGrid } from "@/components/shared/data-grid";

type ContactWithCompany = Contact & {
  company: Company;
};

interface ContactDataGridProps {
  contacts: ContactWithCompany[];
  isLoading: boolean;
}

export function ContactDataGrid({ contacts, isLoading }: ContactDataGridProps) {
  const columns = useContactColumns();

  const filterContacts = (contact: ContactWithCompany, searchText: string) => {
    return (
      contact.name.toLowerCase().includes(searchText) ||
      (contact.email?.toLowerCase().includes(searchText) ?? false) ||
      (contact.phone?.toLowerCase().includes(searchText) ?? false) ||
      (contact.position?.toLowerCase().includes(searchText) ?? false) ||
      contact.company.name.toLowerCase().includes(searchText)
    );
  };

  return (
    <BaseDataGrid
      rows={contacts}
      columns={columns}
      isLoading={isLoading}
      searchPlaceholder="Buscar contatos..."
      filterFn={filterContacts}
    />
  );
}