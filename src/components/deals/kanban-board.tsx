"use client";

import { useState } from "react";
import { Pipeline, Stage, Deal, Company, Contact } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DealForm } from "./deal-form";
import { DealCard } from "./deal-card";
import { useToast } from "@/hooks/use-toast";
import { FormModal } from "@/components/ui/form-modal";

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
  pipelines: PipelineWithStages[];
}

export function KanbanBoard({ pipelines }: KanbanBoardProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineWithStages>(
    pipelines[0] || {
      id: "",
      name: "",
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      stages: [],
    }
  );
  const [stages, setStages] = useState(selectedPipeline.stages);
  const { toast } = useToast();

  const onDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent, stageId: string) => {
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
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {pipelines.map((pipeline) => (
            <Button
              key={pipeline.id}
              variant={selectedPipeline.id === pipeline.id ? "default" : "outline"}
              onClick={() => {
                setSelectedPipeline(pipeline);
                setStages(pipeline.stages);
              }}
            >
              {pipeline.name}
            </Button>
          ))}
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Negócio
        </Button>
      </div>

      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Novo Negócio"
        description="Adicione um novo negócio ao pipeline"
      >
        <DealForm
          pipeline={selectedPipeline}
          onClose={() => setShowForm(false)}
        />
      </FormModal>

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
    </div>
  );
}