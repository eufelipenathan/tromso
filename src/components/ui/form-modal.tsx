"use client";

import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { X } from "lucide-react";

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  isSubmitting?: boolean;
}

export function FormModal({
  open,
  onClose,
  title,
  description,
  children,
  isSubmitting,
}: FormModalProps) {
  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent className="w-[800px]">
        <ModalHeader className="h-16 flex items-center justify-between border-b px-6 rounded-t-lg">
          <div>
            <ModalTitle className="text-lg font-semibold">{title}</ModalTitle>
            {description && (
              <ModalDescription className="text-sm mt-1">
                {description}
              </ModalDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </ModalHeader>

        <div className="p-6 max-h-[calc(90vh-9rem)] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        <ModalFooter className="h-14 px-6 flex items-center justify-end gap-2 border-t rounded-b-lg">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            form="company-form"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            form="company-form"
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}