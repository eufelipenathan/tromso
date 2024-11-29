import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CustomField } from '@/types';
import SortableField from './SortableField';

interface SortableFieldsProps {
  fields: CustomField[];
  onFieldsReorder: (fields: CustomField[]) => void;
  onEditField: (field: CustomField) => void;
  onDeleteField: (field: CustomField) => void;
}

const SortableFields: React.FC<SortableFieldsProps> = ({
  fields,
  onFieldsReorder,
  onEditField,
  onDeleteField,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = fields.findIndex(field => field.id === active.id);
    const newIndex = fields.findIndex(field => field.id === over.id);
    
    const newFields = arrayMove(fields, oldIndex, newIndex);
    onFieldsReorder(newFields);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map(field => field.id)}
        strategy={verticalListSortingStrategy}
      >
        {fields.map(field => (
          <SortableField
            key={field.id}
            field={field}
            onEdit={() => onEditField(field)}
            onDelete={() => onDeleteField(field)}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default SortableFields;