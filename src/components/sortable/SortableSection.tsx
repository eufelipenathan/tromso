import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CustomSection, CustomField } from '@/types';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import SortableFields from './SortableFields';
import Button from '../Button';

interface SortableSectionProps {
  section: CustomSection;
  fields: CustomField[];
  onFieldsReorder: (fields: CustomField[]) => void;
  onEditField: (field: CustomField) => void;
  onDeleteField: (field: CustomField) => void;
  onEditSection: () => void;
  onDeleteSection: () => void;
  onAddField: () => void;
}

const SortableSection: React.FC<SortableSectionProps> = ({
  section,
  fields,
  onFieldsReorder,
  onEditField,
  onDeleteField,
  onEditSection,
  onDeleteSection,
  onAddField,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b flex items-center">
        <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 mr-3">
          <GripVertical className="h-5 w-5" />
        </button>
        
        <h3 className="text-lg font-medium text-gray-900 flex-1">{section.name}</h3>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={onAddField}
            className="px-4 py-2 text-sm font-medium"
            variant="ghost"
            loadingKey={`add-field-${section.id}`}
          >
            Adicionar campo
          </Button>
          <Button
            onClick={onEditSection}
            className="p-2"
            variant="secondary"
            loadingKey={`edit-section-${section.id}`}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={onDeleteSection}
            className="p-2"
            variant="danger"
            loadingKey={`delete-section-${section.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <SortableFields
          fields={fields}
          onFieldsReorder={onFieldsReorder}
          onEditField={onEditField}
          onDeleteField={onDeleteField}
        />
      </div>
    </div>
  );
};

export default SortableSection;