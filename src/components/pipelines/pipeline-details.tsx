"use client";

import { Pipeline, Stage, Deal, Company, Contact } from "@prisma/client";
import { DealForm } from "../deals/deal-form";
import { KanbanBoard } from "./kanban-board";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type StageWithDeals = Stage & {
  deals: Array<Deal & {
    company: Company;
    contact: Contact;
  }>;
};

type PipelineWithStages = Pipeline & {
  stages: StageWithDeals[];
};

interface PipelineDetailsProps {
  pipeline: PipelineWithStages;
}

export function PipelineDetails({ pipeline }: PipelineDetailsProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {pipeline.name}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {pipeline.stages.length} estágios
              </p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Negócio
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {showForm && (
          <div className="mb-8">
            <DealForm
              pipeline={pipeline}
              onClose={() => setShowForm(false)}
            />
          </div>
        )}
        <KanbanBoard pipeline={pipeline} />
      </div>
    </div>
  );
}