"use client";

import {
  Building2,
  TrendingUp,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardMetricsProps {
  activeDeals: number;
  wonDeals: number;
  activeCompanies: number;
  totalValue: number;
}

export function DashboardMetrics({
  activeDeals,
  wonDeals,
  activeCompanies,
  totalValue,
}: DashboardMetricsProps) {
  const metrics = [
    {
      name: "Negócios Ativos",
      value: activeDeals,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      name: "Negócios Ganhos",
      value: wonDeals,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      name: "Empresas Ativas",
      value: activeCompanies,
      icon: Building2,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      name: "Valor Total",
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.name}
          className="rounded-lg border bg-card p-6"
        >
          <div className="flex items-center gap-4">
            <div className={`rounded-full ${metric.bgColor} p-3`}>
              <metric.icon className={`h-6 w-6 ${metric.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {metric.name}
              </p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}