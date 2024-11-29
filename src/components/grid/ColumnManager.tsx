import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GridColumn, GridPreferences } from '@/types/grid';
import Modal from '../Modal';
import Button from '../Button';
import SortableColumn from './SortableColumn';

interface ColumnManagerProps {
  isOpen: boolean;
  onClose: () => void;
  columns: GridColumn[];
  preferences?: GridPreferences | null;
  onChange?: (preferences: Partial<GridPreferences>) => void;
  defaultColumns?: string[];
}

interface GroupedColumns {
  [section: string]: GridColumn[];
}

const ColumnManager: React.FC<ColumnManagerProps> = ({
  isOpen,
  onClose,
  columns,
  preferences,
  onChange,
  defaultColumns
}) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [groupedColumns, setGroupedColumns] = useState<GroupedColumns>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (preferences?.columns) {
      // Se existem preferências salvas, use-as
      const savedColumns = preferences.columns
        .sort((a, b) => a.order - b.order)
        .map(col => col.key);
      
      // Adiciona colunas que não estão nas preferências ao final
      const missingColumns = columns
        .map(col => col.key)
        .filter(key => !savedColumns.includes(key));
      
      setSelectedColumns(
        preferences.columns
          .filter(col => col.visible)
          .map(col => col.key)
      );
      setColumnOrder([...savedColumns, ...missingColumns]);
    } else if (defaultColumns) {
      // Se não há preferências, mostra todas as colunas na ordem padrão,
      // mas apenas as da seção 'Informações Básicas' selecionadas
      setSelectedColumns(defaultColumns);
      setColumnOrder(columns.map(col => col.key));
    }

    // Group columns by section
    const grouped = columns.reduce((acc, column) => {
      const section = column.section || 'Outros';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(column);
      return acc;
    }, {} as GroupedColumns);

    setGroupedColumns(grouped);
  }, [columns, preferences, defaultColumns]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = columnOrder.indexOf(active.id);
    const newIndex = columnOrder.indexOf(over.id);
    
    const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
    setColumnOrder(newOrder);
  };

  const handleToggleColumn = (columnKey: string) => {
    setSelectedColumns(prev => {
      if (prev.includes(columnKey)) {
        return prev.filter(key => key !== columnKey);
      }
      return [...prev, columnKey];
    });
  };

  const handleSave = () => {
    const newColumns = columnOrder.map((key, index) => ({
      key,
      visible: selectedColumns.includes(key),
      order: index
    }));

    onChange?.({ columns: newColumns });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerenciar Colunas"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Selecione as colunas que deseja exibir e arraste para reordenar.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columnOrder}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {Object.entries(groupedColumns).map(([section, sectionColumns]) => (
                <div key={section} className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">{section}</h3>
                  <div className="space-y-2">
                    {sectionColumns
                      .filter(column => columnOrder.includes(column.key))
                      .sort((a, b) => 
                        columnOrder.indexOf(a.key) - columnOrder.indexOf(b.key)
                      )
                      .map(column => (
                        <SortableColumn
                          key={column.key}
                          column={column}
                          selected={selectedColumns.includes(column.key)}
                          onToggle={() => handleToggleColumn(column.key)}
                        />
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            onClick={onClose}
            variant="ghost"
            className="h-10"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="h-10"
          >
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ColumnManager;