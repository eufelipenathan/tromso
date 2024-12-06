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
import { Portal } from "./portal";
import { ConfirmationDialog } from "./confirmation-dialog";
import { useState } from "react";

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  isSubmitting?: boolean;
  formId?: string;
  hasTemporaryData?: boolean;
}

export function FormModal({
  open,
  onClose,
  title,
  description,
  children,
  isSubmitting,
  formId = "company-form",
  hasTemporaryData = false,
}: FormModalProps) {
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  if (!open) return null;

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      if (hasTemporaryData) {
        setShowConfirmClose(true);
      } else {
        onClose();
      }
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasTemporaryData) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const form = document.getElementById(formId) as HTMLFormElement;
    if (form) {
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      form.dispatchEvent(submitEvent);
    }
  };

  return (
    <Portal>
      <Modal open={open} onOpenChange={handleModalOpenChange}>
        <ModalContent
          className="w-[800px]"
          onClick={(e) => e.stopPropagation()}
        >
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
              onClick={handleCloseClick}
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
              onClick={handleCloseClick}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmationDialog
        open={showConfirmClose}
        onOpenChange={setShowConfirmClose}
        title="Cancelar cadastro"
        description="Existem contatos temporários que serão perdidos ao cancelar. Deseja continuar?"
        confirmText="Sim, cancelar"
        onConfirm={() => {
          setShowConfirmClose(false);
          onClose();
        }}
      />
    </Portal>
  );
}
