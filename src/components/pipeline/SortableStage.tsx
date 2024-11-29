import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PipelineStage } from '@/types/pipeline';
import { GripVertical } from 'lucide-react';
import Button from '../Button';

interface SortableStageProps {
  stage: PipelineStage;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableStage: React.FC<SortableStageProps> = ({
  stage,
  onEdit,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: stage.id!,
    data: stage
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined
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

        <span className="font-medium text-gray-900">{stage.name}</span>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          onClick={onEdit}
          variant="ghost"
          size="sm"
          loadingKey={`edit-stage-${stage.id}`}
        >
          Editar
        </Button>
        <Button
          onClick={onDelete}
          variant="ghost"
          size="sm"
          loadingKey={`delete-stage-${stage.id}`}
        >
          Excluir
        </Button>
      </div>
    </div>
  );
};

export default SortableStage;