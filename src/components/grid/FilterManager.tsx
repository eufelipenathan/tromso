import React, { useState, useEffect } from 'react';
import { GridColumn, GridPreferences } from '@/types/grid';
import Modal from '../Modal';
import Button from '../Button';
import { Plus, X } from 'lucide-react';

interface FilterManagerProps {
  isOpen: boolean;
  onClose: () => void;
  columns: GridColumn[];
  preferences?: GridPreferences | null;
  onChange?: (filters: GridPreferences['filters']) => void;
}

const operators = [
  { value: 'contains', label: 'Contém' },
  { value: 'equals', label: 'Igual a' },
  { value: 'startsWith', label: 'Começa com' },
  { value: 'endsWith', label: 'Termina com' },
  { value: 'greaterThan', label: 'Maior que' },
  { value: 'lessThan', label: 'Menor que' }
];

const FilterManager: React.FC<FilterManagerProps> = ({
  isOpen,
  onClose,
  columns,
  preferences,
  onChange
}) => {
  const [localFilters, setLocalFilters] = useState(preferences?.filters || []);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(preferences?.filters || []);
      setHasChanges(false);
    }
  }, [isOpen, preferences?.filters]);

  const handleAddFilter = () => {
    const filterableColumns = columns.filter(col => col.filterable);
    if (filterableColumns.length === 0) return;

    const newFilter = {
      key: filterableColumns[0].key,
      operator: 'contains',
      value: ''
    };

    setLocalFilters(prev => [...prev, newFilter]);
    setHasChanges(true);
  };

  const handleRemoveFilter = (index: number) => {
    setLocalFilters(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleClearFilters = () => {
    setLocalFilters([]);
    setHasChanges(true);
  };

  const handleChangeFilter = (index: number, field: string, value: string) => {
    setLocalFilters(prev => {
      const newFilters = [...prev];
      newFilters[index] = {
        ...newFilters[index],
        [field]: value
      };
      return newFilters;
    });
    setHasChanges(true);
  };

  const handleApplyFilters = () => {
    const validFilters = localFilters.filter(filter => 
      filter.value.trim() !== '' && 
      filter.key && 
      filter.operator
    );
    
    onChange?.(validFilters.length > 0 ? validFilters : undefined);
    onClose();
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('Há alterações não salvas. Deseja realmente sair?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const inputClasses = "w-full h-10 px-4 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500";
  const selectClasses = inputClasses;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Gerenciar Filtros"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Configure os filtros para refinar os resultados.
          </p>
          {localFilters.length > 0 && (
            <Button
              onClick={handleClearFilters}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              Limpar Todos
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {localFilters.map((filter, index) => (
            <div 
              key={index} 
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-start">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Campo
                  </label>
                  <select
                    value={filter.key}
                    onChange={(e) => handleChangeFilter(index, 'key', e.target.value)}
                    className={selectClasses}
                  >
                    {columns
                      .filter(col => col.filterable)
                      .map(column => (
                        <option key={column.key} value={column.key}>
                          {column.label}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Condição
                  </label>
                  <select
                    value={filter.operator}
                    onChange={(e) => handleChangeFilter(index, 'operator', e.target.value)}
                    className={selectClasses}
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Valor
                  </label>
                  <input
                    type="text"
                    value={filter.value}
                    onChange={(e) => handleChangeFilter(index, 'value', e.target.value)}
                    className={inputClasses}
                    placeholder="Digite o valor"
                  />
                </div>

                <div className="pt-6">
                  <Button
                    onClick={() => handleRemoveFilter(index)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button
            onClick={handleAddFilter}
            variant="secondary"
            className="w-full h-10"
            icon={<Plus className="h-4 w-4" />}
          >
            Adicionar Filtro
          </Button>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            onClick={handleClose}
            variant="ghost"
            className="h-10"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="h-10"
            disabled={!hasChanges}
          >
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FilterManager;