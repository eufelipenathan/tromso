"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PipelineForm } from "./pipeline-form";
import { PipelineTable } from "./pipeline-table";

export function PipelineList() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pipeline
        </Button>
      </div>

      {showForm && <PipelineForm onClose={() => setShowForm(false)} />}
      <PipelineTable />
    </div>
  );
}