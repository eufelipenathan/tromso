import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CustomField } from '@/types';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import Button from '../Button';

interface SortableFieldProps {
  field: CustomField;
  onEdit: () => void;
  onDelete: () => void;
}

const fieldTypeLabels: Record<string, string> = {
  text: 'Texto',
  number: 'Número',
  date: 'Data',
  select: 'Lista de seleção'
};

const SortableField: React.FC<SortableFieldProps> = ({ field, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between py-3 border-b last:border-0"
    >
      <div className="flex items-center space-x-4">
        <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
          <GripVertical className="h-5 w-5" />
        </button>
        <div>
          <h4 className="text-sm font-medium text-gray-900">{field.name}</h4>
          <p className="text-sm text-gray-500">
            Tipo: {fieldTypeLabels[field.type]}
            {field.type === 'select' && field.multipleSelect && ' • Múltipla'}
            {field.required && ' • Obrigatório'}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={onEdit}
          className="p-2"
          variant="secondary"
          loadingKey={`edit-field-${field.id}`}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          onClick={onDelete}
          className="p-2"
          variant="danger"
          loadingKey={`delete-field-${field.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SortableField;