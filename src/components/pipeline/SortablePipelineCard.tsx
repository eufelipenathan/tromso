import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pipeline, PipelineStage } from '@/types/pipeline';
import { GripVertical } from 'lucide-react';
import Button from '../Button';
import StageList from './StageList';

interface SortablePipelineCardProps {
  pipeline: Pipeline;
  onEdit: () => void;
  onDelete: () => void;
  onEditStage: (stage: PipelineStage) => void;
  onDeleteStage: (stage: PipelineStage) => void;
  onReorderStages: (stages: PipelineStage[]) => void;
  onAddStage: () => void;
  onManageLossReasons: () => void;
}

const SortablePipelineCard: React.FC<SortablePipelineCardProps> = ({
  pipeline,
  onEdit,
  onDelete,
  onEditStage,
  onDeleteStage,
  onReorderStages,
  onAddStage,
  onManageLossReasons
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: pipeline.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm border"
    >
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {pipeline.name}
            </h3>
            {pipeline.description && (
              <p className="mt-1 text-sm text-gray-500">
                {pipeline.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={onManageLossReasons}
            variant="secondary"
            size="sm"
            loadingKey={`edit-pipeline-reasons-${pipeline.id}`}
          >
            Motivos de Perda ({pipeline.lossReasons?.length || 0})
          </Button>

          <Button
            onClick={onAddStage}
            variant="secondary"
            size="sm"
            loadingKey={`new-stage-${pipeline.id}`}
          >
            Nova Etapa
          </Button>

          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            loadingKey={`edit-pipeline-${pipeline.id}`}
          >
            Editar
          </Button>

          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            loadingKey={`delete-pipeline-${pipeline.id}`}
          >
            Excluir
          </Button>
        </div>
      </div>

      <StageList 
        pipeline={pipeline}
        onEditStage={onEditStage}
        onDeleteStage={onDeleteStage}
        onReorderStages={onReorderStages}
      />
    </div>
  );
};

export default SortablePipelineCard;