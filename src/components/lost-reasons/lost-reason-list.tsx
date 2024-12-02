"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LostReasonForm } from "./lost-reason-form";
import { LostReasonTable } from "./lost-reason-table";

export function LostReasonList() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Motivo
        </Button>
      </div>

      {showForm && <LostReasonForm onClose={() => setShowForm(false)} />}
      <LostReasonTable />
    </div>
  );
}