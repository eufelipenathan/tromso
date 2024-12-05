import { KanbanBoard } from "@/components/deals/kanban-board";
import { prisma } from "@/lib/prisma";

export default async function DealsPage() {
  const pipelines = await prisma.pipeline.findMany({
    where: { deletedAt: null },
    include: {
      stages: {
        where: { deletedAt: null },
        orderBy: { order: "asc" },
        include: {
          deals: {
            where: { deletedAt: null },
            include: {
              company: true,
              contact: true,
            },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Negócios
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gerencie seus negócios através do quadro kanban
        </p>
      </div>
      <KanbanBoard pipelines={pipelines} />
    </div>
  );
}