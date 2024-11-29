import React from 'react';
import { Pipeline, PipelineStage } from '@/types/pipeline';
import Button from '../Button';
import StageList from './StageList';
import * as Icons from 'lucide-react';

interface PipelineCardProps {
  pipeline: Pipeline;
  onEdit: () => void;
  onDelete: () => void;
  onEditStage: (stage: PipelineStage) => void;
  onDeleteStage: (stage: PipelineStage) => void;
  onReorderStages: (stages: PipelineStage[]) => void;
  onAddStage: () => void;
  onManageLossReasons: () => void;
}

const PipelineCard: React.FC<PipelineCardProps> = ({
  pipeline,
  onEdit,
  onDelete,
  onEditStage,
  onDeleteStage,
  onReorderStages,
  onAddStage,
  onManageLossReasons
}) => {
  const Icon = pipeline.icon 
    ? Icons[pipeline.icon as keyof typeof Icons]
    : Icons.Banknote;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-4 sm:px-6 py-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5 text-gray-600 flex-shrink-0" />
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

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={onManageLossReasons}
              variant="secondary"
              size="sm"
              loadingKey={`edit-pipeline-reasons-${pipeline.id}`}
              className="min-w-[120px] justify-center whitespace-nowrap"
            >
              Motivos ({pipeline.lossReasons?.length || 0})
            </Button>

            <Button
              onClick={onAddStage}
              variant="secondary"
              size="sm"
              loadingKey={`new-stage-${pipeline.id}`}
              className="min-w-[100px] justify-center whitespace-nowrap"
            >
              Nova Etapa
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                onClick={onEdit}
                variant="ghost"
                size="sm"
                loadingKey={`edit-pipeline-${pipeline.id}`}
                className="min-w-[80px] justify-center whitespace-nowrap"
              >
                Editar
              </Button>

              <Button
                onClick={onDelete}
                variant="ghost"
                size="sm"
                loadingKey={`delete-pipeline-${pipeline.id}`}
                className="min-w-[80px] justify-center whitespace-nowrap"
              >
                Excluir
              </Button>
            </div>
          </div>
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

export default PipelineCard;