"use client";

import { Pipeline, Stage, Deal, Company, Contact } from "@prisma/client";
import { DealCard } from "./deal-card";
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type StageWithDeals = Stage & {
  deals: Array<Deal & {
    company: Company;
    contact: Contact;
  }>;
};

type PipelineWithStages = Pipeline & {
  stages: StageWithDeals[];
};

interface KanbanBoardProps {
  pipeline: PipelineWithStages;
}

export function KanbanBoard({ pipeline }: KanbanBoardProps) {
  const { toast } = useToast();
  const [stages, setStages] = useState(pipeline.stages);

  const onDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = useCallback(
    async (e: React.DragEvent, stageId: string) => {
      e.preventDefault();
      const dealId = e.dataTransfer.getData("dealId");

      try {
        const response = await fetch(`/api/deals/${dealId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ stageId }),
        });

        if (!response.ok) {
          throw new Error("Erro ao mover negócio");
        }

        setStages((currentStages) =>
          currentStages.map((stage) => ({
            ...stage,
            deals:
              stage.id === stageId
                ? [
                    ...stage.deals,
                    ...currentStages
                      .flatMap((s) => s.deals)
                      .filter((d) => d.id === dealId),
                  ]
                : stage.deals.filter((deal) => deal.id !== dealId),
          }))
        );

        toast({
          title: "Sucesso",
          description: "Negócio movido com sucesso",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao mover o negócio",
        });
      }
    },
    [toast]
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <div
          key={stage.id}
          className="flex-none w-80"
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, stage.id)}
        >
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{stage.name}</h3>
              <span className="text-sm text-muted-foreground">
                {stage.deals.length}
              </span>
            </div>
            <div className="space-y-4">
              {stage.deals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onDragStart={(e) => onDragStart(e, deal.id)}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}