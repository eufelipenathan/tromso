import React, { useState, useRef, useEffect } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { Contact } from '@/types';
import { MoreVertical } from 'lucide-react';
import Button from '@/components/Button';

interface ActionsRendererProps extends ICellRendererParams {
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ActionsRenderer(props: ActionsRendererProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onEdit(props.data);
    setMenuOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onDelete(props.data);
    setMenuOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
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
          className="fixed z-[9999] bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1"
          style={{
            minWidth: '12rem',
            top: menuRef.current?.getBoundingClientRect().bottom ?? 0,
            left: menuRef.current?.getBoundingClientRect().left ?? 0,
          }}
        >
          <button
            type="button"
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={handleEdit}
          >
            Editar
          </button>
          <button
            type="button"
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={handleDelete}
          >
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}