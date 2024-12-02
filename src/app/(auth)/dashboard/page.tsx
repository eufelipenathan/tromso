import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const metrics = await prisma.$transaction([
    // Total de negócios ativos
    prisma.deal.count({
      where: {
        deletedAt: null,
        closedAt: null,
      },
    }),
    // Total de negócios ganhos
    prisma.deal.count({
      where: {
        deletedAt: null,
        closedAt: { not: null },
        lostReasonId: null,
      },
    }),
    // Total de empresas ativas
    prisma.company.count({
      where: {
        deletedAt: null,
      },
    }),
    // Valor total dos negócios ativos
    prisma.deal.aggregate({
      where: {
        deletedAt: null,
        closedAt: null,
      },
      _sum: {
        value: true,
      },
    }),
  ]);

  const [activeDeals, wonDeals, activeCompanies, totalValue] = metrics;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Visão geral do seu CRM
        </p>
      </div>

      <DashboardMetrics
        activeDeals={activeDeals}
        wonDeals={wonDeals}
        activeCompanies={activeCompanies}
        totalValue={totalValue._sum.value || 0}
      />

      <div className="mt-8">
        <DashboardCharts />
      </div>
    </div>
  );
}