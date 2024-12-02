"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatPhone } from "@/lib/utils";
import { Contact, Company } from "@prisma/client";
import Link from "next/link";

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

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center text-sm text-muted-foreground">
          Carregando contatos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-destructive/10">
        <div className="p-8 text-center text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center text-sm text-muted-foreground">
          Nenhum contato cadastrado
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Cadastro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/contatos/${contact.id}`}
                  className="hover:text-primary"
                >
                  {contact.name}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/empresas/${contact.companyId}`}
                  className="hover:text-primary"
                >
                  {contact.company.name}
                </Link>
              </TableCell>
              <TableCell>{contact.position || "-"}</TableCell>
              <TableCell>
                {contact.email ? (
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-primary hover:underline"
                  >
                    {contact.email}
                  </a>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {contact.phone ? formatPhone(contact.phone) : "-"}
              </TableCell>
              <TableCell>{formatDate(contact.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}