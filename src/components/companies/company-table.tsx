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
import { Company } from "@prisma/client";
import { CompanySearch } from "./company-search";
import Link from "next/link";

export function CompanyTable() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadCompanies() {
      try {
        const response = await fetch("/api/companies");
        if (!response.ok) {
          throw new Error("Falha ao carregar empresas");
        }
        const data = await response.json();
        setCompanies(data);
        setFilteredCompanies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    }

    loadCompanies();
  }, []);

  useEffect(() => {
    const searchLower = search.toLowerCase();
    const filtered = companies.filter((company) => {
      return (
        company.name.toLowerCase().includes(searchLower) ||
        (company.email?.toLowerCase().includes(searchLower) ?? false) ||
        (company.phone?.toLowerCase().includes(searchLower) ?? false) ||
        (company.website?.toLowerCase().includes(searchLower) ?? false)
      );
    });
    setFilteredCompanies(filtered);
  }, [search, companies]);

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center text-sm text-muted-foreground">
          Carregando empresas...
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

  if (companies.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center text-sm text-muted-foreground">
          Nenhuma empresa cadastrada
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CompanySearch value={search} onChange={setSearch} />
      
      {filteredCompanies.length === 0 ? (
        <div className="rounded-lg border bg-card">
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhuma empresa encontrada
          </div>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/empresas/${company.id}`}
                      className="hover:text-primary"
                    >
                      {company.name}
                    </Link>
                  </TableCell>
                  <TableCell>{company.email}</TableCell>
                  <TableCell>
                    {company.phone ? formatPhone(company.phone) : "-"}
                  </TableCell>
                  <TableCell>
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {company.website}
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{formatDate(company.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}