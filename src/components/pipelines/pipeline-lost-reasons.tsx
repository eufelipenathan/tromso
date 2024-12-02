"use client";

import { useState, useEffect } from "react";
import { LostReason } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddLostReasonsDialog } from "./add-lost-reasons-dialog";
import { usePipelineStore } from "@/stores/use-pipeline-store";
import { SortableLostReasons } from "./sortable-lost-reasons";

export function PipelineLostReasons() {
  const [availableReasons, setAvailableReasons] = useState<LostReason[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const { selectedLostReasonIds, addLostReason } = usePipelineStore();

  useEffect(() => {
    loadLostReasons();
  }, []);

  const loadLostReasons = async () => {
    try {
      const response = await fetch('/api/lost-reasons');
      if (!response.ok) {
        throw new Error("Falha ao carregar motivos de perda");
      }
      const data = await response.json();
      setAvailableReasons(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar motivos de perda",
      });
    }
  };

  const handleAddLostReasons = (reasonIds: string[]) => {
    reasonIds.forEach(id => addLostReason(id));
    setShowAddDialog(false);
  };

  const getUnselectedReasons = () => {
    return availableReasons.filter(reason => 
      !selectedLostReasonIds.includes(reason.id)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Motivo
        </Button>
      </div>

      <SortableLostReasons />

      <AddLostReasonsDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        availableReasons={getUnselectedReasons()}
        onAdd={handleAddLostReasons}
      />
    </div>
  );
}