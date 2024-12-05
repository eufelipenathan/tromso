"use client";

import { useState } from "react";
import { LostReason } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AddLostReasonsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableReasons: LostReason[];
  onAdd: (reasonIds: string[]) => void;
}

export function AddLostReasonsDialog({
  open,
  onOpenChange,
  availableReasons,
  onAdd,
}: AddLostReasonsDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReasons, setSelectedReasons] = useState<Set<string>>(new Set());

  const filteredReasons = availableReasons.filter((reason) =>
    reason.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReasonClick = (reasonId: string) => {
    const newSelected = new Set(selectedReasons);
    if (newSelected.has(reasonId)) {
      newSelected.delete(reasonId);
    } else {
      newSelected.add(reasonId);
    }
    setSelectedReasons(newSelected);
  };

  const handleAdd = () => {
    onAdd(Array.from(selectedReasons));
    setSelectedReasons(new Set());
    setSearchTerm("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Motivos de Perda</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            placeholder="Buscar motivos..."
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {filteredReasons.length > 0 ? (
            filteredReasons.map((reason) => (
              <button
                key={reason.id}
                onClick={() => handleReasonClick(reason.id)}
                className={cn(
                  "w-full px-4 py-2 text-left rounded-md hover:bg-accent",
                  selectedReasons.has(reason.id) && "bg-accent"
                )}
              >
                {reason.name}
              </button>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              Nenhum motivo encontrado
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedReasons(new Set());
              setSearchTerm("");
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedReasons.size === 0}
          >
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}