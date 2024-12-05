"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardCharts() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Aqui você pode adicionar chamadas à API para buscar dados dos gráficos
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados dos gráficos:", error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Carregando...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Funil de Vendas</CardTitle>
          <CardDescription>
            Distribuição de negócios por estágio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Adicione aqui o componente do gráfico de funil */}
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Gráfico de Funil (em desenvolvimento)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Desempenho Mensal</CardTitle>
          <CardDescription>
            Valor total de negócios por mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Adicione aqui o componente do gráfico de linha */}
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Gráfico de Linha (em desenvolvimento)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}