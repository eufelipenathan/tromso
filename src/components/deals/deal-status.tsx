"use client";

import { Deal, LostReason } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

interface DealStatusProps {
  deal: Deal & {
    lostReason: LostReason | null;
  };
}

export function DealStatus({ deal }: DealStatusProps) {
  const { toast } = useToast();
  const [lostReasons, setLostReasons] = useState<LostReason[]>([]);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadLostReasons() {
      const response = await fetch("/api/lost-reasons");
      const data = await response.json();
      setLostReasons(data);
    }

    loadLostReasons();
  }, []);

  const handleWin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/deals/${deal.id}/win`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erro ao ganhar negócio");
      }

      toast({
        title: "Sucesso",
        description: "Negócio ganho com sucesso!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao ganhar o negócio",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLose = async () => {
    if (!selectedReason) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um motivo para a perda",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/deals/${deal.id}/lose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lostReasonId: selectedReason }),
      });

      if (!response.ok) {
        throw new Error("Erro ao perder negócio");
      }

      toast({
        title: "Atualizado",
        description: "Negócio marcado como perdido",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o negócio",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (deal.closedAt) {
    return (
      <div className="flex items-center space-x-2">
        {deal.lostReason ? (
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-destructive/10 text-destructive">
            Perdido
          </span>
        ) : (
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-success/10 text-success">
            Ganho
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Select
        value={selectedReason}
        onValueChange={setSelectedReason}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Motivo da perda" />
        </SelectTrigger>
        <SelectContent>
          {lostReasons.map((reason) => (
            <SelectItem key={reason.id} value={reason.id}>
              {reason.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="destructive"
        onClick={handleLose}
        disabled={isLoading}
      >
        Perder
      </Button>
      <Button
        variant="default"
        onClick={handleWin}
        disabled={isLoading}
      >
        Ganhar
      </Button>
    </div>
  );
}