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
import { Pipeline, Stage } from "@prisma/client";
import Link from "next/link";

type PipelineWithStages = Pipeline & {
  stages: Stage[];
};

export function PipelineTable() {
  const [pipelines, setPipelines] = useState<PipelineWithStages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPipelines() {
      try {
        const response = await fetch("/api/pipelines");
        if (!response.ok) {
          throw new Error("Falha ao carregar pipelines");
        }
        const data = await response.json();
        setPipelines(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    }

    loadPipelines();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center text-sm text-muted-foreground">
          Carregando pipelines...
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

  if (pipelines.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center text-sm text-muted-foreground">
          Nenhum pipeline cadastrado
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
            <TableHead>Estágios</TableHead>
            <TableHead>Cadastro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pipelines.map((pipeline) => (
            <TableRow key={pipeline.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/pipelines/${pipeline.id}`}
                  className="hover:text-primary"
                >
                  {pipeline.name}
                </Link>
              </TableCell>
              <TableCell>
                {pipeline.stages
                  .sort((a, b) => a.order - b.order)
                  .map((stage) => stage.name)
                  .join(" → ")}
              </TableCell>
              <TableCell>{formatDate(pipeline.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}