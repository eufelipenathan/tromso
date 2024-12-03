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
import { formatDate } from "@/lib/utils";
import { LostReason } from "@prisma/client";

export function LostReasonTable() {
  const [lostReasons, setLostReasons] = useState<LostReason[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLostReasons() {
      try {
        const response = await fetch("/api/lost-reasons");
        if (!response.ok) {
          throw new Error("Falha ao carregar motivos de perda");
        }
        const data = await response.json();
        setLostReasons(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    }

    loadLostReasons();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center text-sm text-muted-foreground">
          Carregando motivos de perda...
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

  if (lostReasons.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center text-sm text-muted-foreground">
          Nenhum motivo de perda cadastrado
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
            <TableHead>Cadastro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lostReasons.map((reason) => (
            <TableRow key={reason.id}>
              <TableCell className="font-medium">{reason.name}</TableCell>
              <TableCell>{formatDate(reason.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}