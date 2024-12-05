"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface MoveFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMove: (targetSectionId: string) => Promise<void>;
  currentSectionId: string;
  sections: Array<{ id: string; name: string }>;
}

export function MoveFieldDialog({
  open,
  onOpenChange,
  onMove,
  currentSectionId,
  sections,
}: MoveFieldDialogProps) {
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const availableSections = sections.filter(
    (section) => section.id !== currentSectionId
  );

  useEffect(() => {
    if (open && availableSections.length === 0) {
      toast({
        variant: "warning",
        title: "Aviso",
        description: "Não há outras seções disponíveis para mover o campo.",
      });
      onOpenChange(false);
    }
  }, [open, availableSections.length, toast, onOpenChange]);

  const handleSubmit = async () => {
    if (!selectedSection) return;

    try {
      setIsSubmitting(true);
      await onMove(selectedSection);
      setSelectedSection("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mover Campo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Seção de destino</Label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma seção" />
              </SelectTrigger>
              <SelectContent>
                {availableSections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedSection || isSubmitting}
          >
            {isSubmitting ? "Movendo..." : "Mover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
