// src/features/companies/components/grid/ActionCellRenderer.tsx
import React from "react";
import { ICellRendererParams } from "ag-grid-community";
import { Company } from "@/types";
import { Pencil, Trash2 } from "lucide-react";
import Button from "@/components/Button";

interface ActionCellRendererProps extends ICellRendererParams {
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export const ActionCellRenderer: React.FC<ActionCellRendererProps> = (props) => {
  const { data, onEdit, onDelete } = props;

  if (!data) {
    console.warn("ActionCellRenderer: No data received!");
    return null;
  }

  console.log("ActionCellRenderer: Rendering actions for data:", data);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Previne interferências do AG Grid
    console.log("Edit button clicked for:", data);
    if (onEdit) {
      onEdit(data);
    } else {
      console.error("onEdit function not provided!");
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Previne interferências do AG Grid
    console.log("Delete button clicked for:", data);
    if (onDelete) {
      onDelete(data);
    } else {
      console.error("onDelete function not provided!");
    }
  };

  return (
    <div className="flex space-x-2">
      <Button variant="ghost" size="sm" onClick={handleEdit}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
