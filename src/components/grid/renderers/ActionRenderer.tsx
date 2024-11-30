import React from 'react';
import { GridRenderCellParams } from '@mui/x-data-grid';
import Button from '@/components/Button';
import { Pencil, Trash2 } from 'lucide-react';

export const renderActions = <T extends { id: string }>(
  params: GridRenderCellParams,
  onEdit: (row: T) => void,
  onDelete: (row: T) => void
) => (
  <div className="flex space-x-2">
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onEdit(params.row);
      }}
      className="p-2"
    >
      <Pencil className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onDelete(params.row);
      }}
      className="p-2"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
);