"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FormSectionProps {
  title: string;
  defaultOpen?: boolean;
  hasRequiredFields?: boolean;
  children: React.ReactNode;
}

export function FormSection({
  title,
  defaultOpen = false,
  hasRequiredFields = false,
  children,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-4 h-8 text-left border-b"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">{title}</span>
        {hasRequiredFields && !isOpen && (
          <span className="ml-2 text-xs text-destructive">
            • Contém campos obrigatórios
          </span>
        )}
      </button>
      <div className={cn("p-4", !isOpen && "hidden")}>{children}</div>
    </div>
  );
}
