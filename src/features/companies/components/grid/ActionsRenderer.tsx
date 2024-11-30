import React, { useState, useRef, useEffect } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { Company } from '@/types';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import Button from '@/components/Button';

interface ActionCellRendererProps extends ICellRendererParams {
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function ActionCellRenderer(props: ActionCellRendererProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleEdit = () => {
    props.onEdit(props.data);
    setMenuOpen(false);
  };

  const handleDelete = () => {
    props.onDelete(props.data);
    setMenuOpen(false);
  };

  return (
    <div className="relative flex items-center justify-center h-full" ref={containerRef}>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className="!h-8 !w-8 !p-0"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {menuOpen && (
        <div
          className="absolute bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1 min-w-[160px]"
          style={{
            top: buttonRef.current?.getBoundingClientRect().bottom + 4,
            left: buttonRef.current?.getBoundingClientRect().left,
          }}
        >
          <button
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 gap-2"
            onClick={handleEdit}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
          <button
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 gap-2"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}
