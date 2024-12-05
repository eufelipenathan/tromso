"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InteractionForm } from "./interaction-form";
import { InteractionFeed } from "./interaction-feed";

interface CompanyInteractionsProps {
  companyId: string;
}

export function CompanyInteractions({ companyId }: CompanyInteractionsProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Interações</h2>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Interação
        </Button>
      </div>
      <div className="p-4">
        {showForm && (
          <div className="mb-6">
            <InteractionForm
              companyId={companyId}
              onClose={() => setShowForm(false)}
            />
          </div>
        )}
        <InteractionFeed companyId={companyId} />
      </div>
    </div>
  );
}