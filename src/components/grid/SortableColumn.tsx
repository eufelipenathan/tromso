import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GridColumn } from '@/types/grid';
import { GripVertical } from 'lucide-react';

interface SortableColumnProps {
  column: GridColumn;
  selected: boolean;
  onToggle: () => void;
}

const SortableColumn: React.FC<SortableColumnProps> = ({
  column,
  selected,
  onToggle
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center space-x-3 p-3 rounded-lg border
        ${selected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
      `}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <label className="flex items-center flex-1 space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">
            {column.label}
          </span>
          <span className="text-xs text-gray-500">
            {column.section}
          </span>
        </div>
      </label>
    </div>
  );
};

export default SortableColumn;