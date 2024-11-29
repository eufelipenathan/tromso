import React, { useState, useEffect, useRef } from 'react';
import { GridColumn, GridPreferences } from '@/types/grid';
import { Filter, RotateCcw, Settings2, ChevronUp, ChevronDown, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import Button from '../Button';
import LoadingState from '../LoadingState';
import ColumnManager from './ColumnManager';
import FilterManager from './FilterManager';
import { useUI } from '@/hooks/useUI';

interface AdvancedGridProps {
  columns: GridColumn[];
  data: any[];
  preferences?: GridPreferences | null;
  onPreferencesChange?: (preferences: Partial<GridPreferences>) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  loading?: boolean;
}

const ActionMenu: React.FC<{
  item: any;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
}> = ({ item, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading } = useUI();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ 
    top: 0, 
    left: 0
  });

  useEffect(() => {
    if (isOpen && buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let left = buttonRect.right + 40;
      
      if (left + menuRect.width > viewportWidth) {
        left = buttonRect.left - menuRect.width - 40;
      }

      if (left < 0) {
        left = 8;
      }

      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      const opensUpward = spaceBelow < menuRect.height && spaceAbove > menuRect.height;

      let top;
      if (opensUpward) {
        top = buttonRect.top - menuRect.height + 8;
      } else {
        top = buttonRect.bottom - 8;
      }

      if (top < 8) {
        top = 8;
      } else if (top + menuRect.height > viewportHeight - 8) {
        top = viewportHeight - menuRect.height - 8;
      }

      setMenuPosition({ top, left });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        buttonRef.current && 
        menuRef.current && 
        !buttonRef.current.contains(event.target as Node) && 
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div 
          ref={menuRef}
          className="fixed z-[100000] min-w-[14rem] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
          style={{
            top: menuPosition.top,
            left: menuPosition.left
          }}
        >
          <div className="py-1">
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(item);
                  setIsOpen(false);
                }}
                disabled={isLoading(`edit-item-${item.id}`)}
                className="w-full px-6 py-3 text-sm text-left text-gray-700 hover:bg-gray-100 disabled:opacity-50 flex items-center space-x-3"
              >
                <Pencil className="h-4 w-4" />
                <span>Editar</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  onDelete(item);
                  setIsOpen(false);
                }}
                disabled={isLoading(`delete-item-${item.id}`)}
                className="w-full px-6 py-3 text-sm text-left text-red-600 hover:bg-red-50 disabled:opacity-50 flex items-center space-x-3"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AdvancedGrid: React.FC<AdvancedGridProps> = ({
  columns,
  data,
  preferences,
  onPreferencesChange,
  onEdit,
  onDelete,
  loading = false
}) => {
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
  const [isFilterManagerOpen, setIsFilterManagerOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState(preferences?.sortBy);
  const [visibleColumns, setVisibleColumns] = useState<GridColumn[]>([]);

  useEffect(() => {
    if (preferences?.columns) {
      const orderedColumns = preferences.columns
        .sort((a, b) => a.order - b.order)
        .filter(col => col.visible)
        .map(col => columns.find(c => c.key === col.key))
        .filter((col): col is GridColumn => !!col);

      setVisibleColumns(orderedColumns);
    } else {
      const defaultColumns = columns.filter(col => 
        col.section === 'Informações Básicas'
      );
      setVisibleColumns(defaultColumns);
    }
  }, [columns, preferences]);

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    const newConfig = {
      key: columnKey,
      direction: sortConfig?.key === columnKey && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    };

    setSortConfig(newConfig);
    onPreferencesChange?.({ sortBy: newConfig });
  };

  const handleResetPreferences = () => {
    const defaultColumns = columns
      .filter(col => col.section === 'Informações Básicas')
      .map((col, index) => ({
        key: col.key,
        visible: true,
        order: index
      }));

    onPreferencesChange?.({
      columns: defaultColumns,
      sortBy: undefined,
      filters: undefined
    });
  };

  const getSortedData = () => {
    if (!sortConfig) return data;

    const column = columns.find(col => col.key === sortConfig.key);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aValue = column.key.includes('.') 
        ? column.key.split('.').reduce((obj, key) => obj?.[key], a)
        : a[column.key];
      const bValue = column.key.includes('.')
        ? column.key.split('.').reduce((obj, key) => obj?.[key], b)
        : b[column.key];

      if (aValue === bValue) return 0;
      
      const result = aValue > bValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? result : -result;
    });
  };

  const getFilteredData = () => {
    if (!preferences?.filters || preferences.filters.length === 0) {
      return getSortedData();
    }

    return getSortedData().filter(item => {
      return preferences.filters!.every(filter => {
        const column = columns.find(col => col.key === filter.key);
        if (!column) return true;

        const value = column.key.includes('.')
          ? column.key.split('.').reduce((obj, key) => obj?.[key], item)
          : item[column.key];

        if (value === undefined || value === null) return false;

        const stringValue = column.format ? column.format(value) : String(value);
        const filterValue = filter.value.toLowerCase();

        switch (filter.operator) {
          case 'contains':
            return stringValue.toLowerCase().includes(filterValue);
          case 'equals':
            return stringValue.toLowerCase() === filterValue;
          case 'startsWith':
            return stringValue.toLowerCase().startsWith(filterValue);
          case 'endsWith':
            return stringValue.toLowerCase().endsWith(filterValue);
          case 'greaterThan':
            return Number(value) > Number(filterValue);
          case 'lessThan':
            return Number(value) < Number(filterValue);
          default:
            return true;
        }
      });
    });
  };

  const renderCell = (item: any, column: GridColumn) => {
    const value = column.key.includes('.')
      ? column.key.split('.').reduce((obj, key) => obj?.[key], item)
      : item[column.key];

    return column.format 
      ? column.format(value)
      : value;
  };

  if (loading) {
    return <LoadingState />;
  }

  const filteredData = getFilteredData();

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsFilterManagerOpen(true)}
            variant="secondary"
            size="sm"
            icon={<Filter className="h-4 w-4" />}
          >
            Filtros
            {preferences?.filters && preferences.filters.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                {preferences.filters.length}
              </span>
            )}
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleResetPreferences}
            variant="secondary"
            size="sm"
            icon={<RotateCcw className="h-4 w-4" />}
          >
            Restaurar Padrão
          </Button>

          <Button
            onClick={() => setIsColumnManagerOpen(true)}
            variant="secondary"
            size="sm"
            icon={<Settings2 className="h-4 w-4" />}
          >
            Colunas
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className={`overflow-x-auto ${data.length === 0 ? 'overflow-y-hidden' : ''}`}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {(onEdit || onDelete) && (
                  <th scope="col" className="relative w-16 px-6 py-4">
                    <span className="sr-only">Ações</span>
                  </th>
                )}
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`
                      px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap
                      ${column.sortable ? 'cursor-pointer select-none' : ''}
                    `}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sortConfig?.key === column.key && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <ActionMenu
                        item={item}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </td>
                  )}
                  {visibleColumns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderCell(item, column)}
                    </td>
                  ))}
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td 
                    colSpan={visibleColumns.length + (onEdit || onDelete ? 1 : 0)}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    Nenhum registro encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ColumnManager
        isOpen={isColumnManagerOpen}
        onClose={() => setIsColumnManagerOpen(false)}
        columns={columns}
        preferences={preferences}
        onChange={onPreferencesChange}
        defaultColumns={columns
          .filter(col => col.section === 'Informações Básicas')
          .map(col => col.key)
        }
      />

      <FilterManager
        isOpen={isFilterManagerOpen}
        onClose={() => setIsFilterManagerOpen(false)}
        columns={columns}
        preferences={preferences}
        onChange={(filters) => onPreferencesChange?.({ filters })}
      />
    </div>
  );
};

export default AdvancedGrid;