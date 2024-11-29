import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LossReason } from '@/types/pipeline';
import { GripVertical, X } from 'lucide-react';
import Button from '../Button';

interface SortableLossReasonProps {
  reason: LossReason;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onRemove?: () => void;
}

const SortableLossReason: React.FC<SortableLossReasonProps> = ({
  reason,
  showActions = true,
  onEdit,
  onDelete,
  onRemove
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: reason.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="px-6 py-4 flex items-center justify-between bg-white"
    >
      <div className="flex items-center space-x-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div>
          <h3 className="font-medium text-gray-900">{reason.name}</h3>
          {reason.description && (
            <p className="text-sm text-gray-500 mt-1">{reason.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {showActions ? (
          <>
            <Button
              onClick={onEdit}
              variant="ghost"
              size="sm"
              loadingKey={`edit-reason-${reason.id}`}
            >
              Editar
            </Button>
            <Button
              onClick={onDelete}
              variant="ghost"
              size="sm"
              loadingKey={`delete-reason-${reason.id}`}
            >
              Excluir
            </Button>
          </>
        ) : (
          <Button
            onClick={onRemove}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-600"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SortableLossReason;