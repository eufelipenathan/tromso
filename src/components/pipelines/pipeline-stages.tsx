"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SortableStages } from "./sortable-stages";
import { usePipelineStore } from "@/stores/use-pipeline-store";

export function PipelineStages() {
  const [newStageName, setNewStageName] = useState("");
  const { stages, addStage } = usePipelineStore();

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    addStage(newStageName);
    setNewStageName("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Novo Estágio</Label>
        <div className="flex gap-2">
          <Input
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            placeholder="Nome do estágio"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddStage();
              }
            }}
          />
          <Button onClick={handleAddStage}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      <SortableStages />
    </div>
  );
}