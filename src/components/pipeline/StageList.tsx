import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Pipeline, PipelineStage } from '@/types/pipeline';
import SortableStage from './SortableStage';

interface StageListProps {
  pipeline: Pipeline;
  onEditStage?: (stage: PipelineStage) => void;
  onDeleteStage?: (stage: PipelineStage) => void;
  onReorderStages?: (stages: PipelineStage[]) => void;
}

const StageList: React.FC<StageListProps> = ({ 
  pipeline,
  onEditStage,
  onDeleteStage,
  onReorderStages
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

    const oldIndex = pipeline.stages.findIndex(s => s.id === active.id);
    const newIndex = pipeline.stages.findIndex(s => s.id === over.id);
    
    const newStages = arrayMove(pipeline.stages, oldIndex, newIndex)
      .map((stage, index) => ({ ...stage, order: index }));

    onReorderStages?.(newStages);
  };

  if (!pipeline.stages || pipeline.stages.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gray-500">
          Nenhuma etapa cadastrada. Clique em "Nova Etapa" para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 border-b">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-700">
          Etapas ({pipeline.stages?.length || 0})
        </h4>
      </div>

      <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pipeline.stages?.map(stage => stage.id!) || []}
            strategy={verticalListSortingStrategy}
          >
            {pipeline.stages?.map(stage => (
              <SortableStage
                key={stage.id}
                stage={stage}
                onEdit={() => onEditStage?.(stage)}
                onDelete={() => onDeleteStage?.(stage)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default StageList;