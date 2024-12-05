"use client";

import { useEffect, useState } from "react";
import { Contact, Company } from "@prisma/client";
import { ContactDataGrid } from "./contact-data-grid";

type ContactWithCompany = Contact & {
  company: Company;
};

export function ContactTable() {
  const [contacts, setContacts] = useState<ContactWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContacts() {
      try {
        const response = await fetch("/api/contacts");
        if (!response.ok) {
          throw new Error("Falha ao carregar contatos");
        }
        const data = await response.json();
        setContacts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    }

    loadContacts();
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border bg-destructive/10">
        <div className="p-8 text-center text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return <ContactDataGrid contacts={contacts} isLoading={isLoading} />;
}