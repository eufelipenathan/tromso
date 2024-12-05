"use client";

import { useState, useEffect } from "react";
import { Company } from "@prisma/client";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const response = await fetch("/api/companies");
        if (!response.ok) {
          throw new Error("Falha ao carregar empresas");
        }
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    }

    loadCompanies();
  }, []);

  return { companies, isLoading, error };
}