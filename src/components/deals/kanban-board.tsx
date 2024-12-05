"use client";

import { useState } from "react";
import { Pipeline, Stage, Deal, Company, Contact } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DealForm } from "./deal-form";
import { DealCard } from "./deal-card";
import { useToast } from "@/hooks/use-toast";
import { FormModal } from "@/components/ui/form-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(
    pipelines[0]?.id || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localPipelines, setLocalPipelines] = useState<PipelineWithStages[]>(pipelines);
  const { toast } = useToast();

  const selectedPipeline = localPipelines.find((p) => p.id === selectedPipelineId);

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

      const updatedDeal = await response.json();

      // Update local state
      setLocalPipelines(prevPipelines => 
        prevPipelines.map(pipeline => ({
          ...pipeline,
          stages: pipeline.stages.map(stage => ({
            ...stage,
            deals: stage.id === stageId
              ? [...stage.deals, updatedDeal]
              : stage.deals.filter(deal => deal.id !== dealId)
          }))
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

  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    setShowForm(false);
  };

  const handleDealSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar negócio");
      }

      const newDeal = await response.json();

      // Update local state
      setLocalPipelines(prevPipelines =>
        prevPipelines.map(pipeline => {
          if (pipeline.id === data.pipelineId) {
            return {
              ...pipeline,
              stages: pipeline.stages.map(stage => {
                if (stage.id === data.stageId) {
                  return {
                    ...stage,
                    deals: [...stage.deals, newDeal]
                  };
                }
                return stage;
              })
            };
          }
          return pipeline;
        })
      );

      toast({
        title: "Sucesso",
        description: "Negócio criado com sucesso",
      });

      setShowForm(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao criar o negócio",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedPipeline) {
    return (
      <div className="text-center text-muted-foreground">
        Nenhum pipeline encontrado
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Select
          value={selectedPipelineId}
          onValueChange={handlePipelineChange}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Selecione um pipeline" />
          </SelectTrigger>
          <SelectContent>
            {localPipelines.map((pipeline) => (
              <SelectItem key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Negócio
        </Button>
      </div>

      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Novo Negócio"
        isSubmitting={isSubmitting}
        formId="deal-form"
      >
        <DealForm
          pipeline={selectedPipeline}
          pipelines={localPipelines}
          onClose={() => setShowForm(false)}
          onSubmit={handleDealSubmit}
          onPipelineChange={handlePipelineChange}
        />
      </FormModal>

      <div className="relative">
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-4 min-w-full w-max">
            {selectedPipeline.stages.map((stage) => (
              <div
                key={stage.id}
                className="flex-none w-80"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, stage.id)}
              >
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-sm">{stage.name}</h3>
                    <span className="text-xs px-2 py-1 bg-muted-foreground/10 rounded-full">
                      {stage.deals.length}
                    </span>
                  </div>
                  <div className="space-y-3">
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
      </div>
    </div>
  );
}