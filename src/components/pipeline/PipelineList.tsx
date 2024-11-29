import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Pipeline, PipelineStage } from '@/types/pipeline';
import SortablePipelineCard from './SortablePipelineCard';

interface PipelineListProps {
  pipelines: Pipeline[];
  onEditPipeline: (pipeline: Pipeline) => void;
  onDeletePipeline: (pipeline: Pipeline) => void;
  onEditStage: (stage: PipelineStage) => void;
  onDeleteStage: (stage: PipelineStage) => void;
  onReorderStages: (pipelineId: string, stages: PipelineStage[]) => void;
  onAddStage: (pipeline: Pipeline) => void;
  onManageLossReasons: (pipeline: Pipeline) => void;
  onReorderPipelines: (pipelines: Pipeline[]) => void;
}

const PipelineList: React.FC<PipelineListProps> = ({
  pipelines,
  onEditPipeline,
  onDeletePipeline,
  onEditStage,
  onDeleteStage,
  onReorderStages,
  onAddStage,
  onManageLossReasons,
  onReorderPipelines,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = pipelines.findIndex((p) => p.id === active.id);
    const newIndex = pipelines.findIndex((p) => p.id === over.id);

    const newPipelines = arrayMove(pipelines, oldIndex, newIndex).map(
      (pipeline, index) => ({ ...pipeline, order: index })
    );

    onReorderPipelines(newPipelines);
  };

  if (pipelines.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <p className="text-sm text-gray-500">
          Nenhum funil cadastrado. Clique em "Novo funil" para começar.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={pipelines.map((pipeline) => pipeline.id!)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-6">
          {pipelines.map((pipeline) => (
            <SortablePipelineCard
              key={pipeline.id}
              pipeline={pipeline}
              onEdit={() => onEditPipeline(pipeline)}
              onDelete={() => {
                if (
                  window.confirm('Tem certeza que deseja excluir este funil?')
                ) {
                  onDeletePipeline(pipeline);
                }
              }}
              onEditStage={onEditStage}
              onDeleteStage={onDeleteStage}
              onReorderStages={(stages) =>
                onReorderStages(pipeline.id!, stages)
              }
              onAddStage={() => onAddStage(pipeline)}
              onManageLossReasons={() => onManageLossReasons(pipeline)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default PipelineList;
