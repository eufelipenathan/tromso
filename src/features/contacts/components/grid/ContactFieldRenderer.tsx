import React, { useState, useRef, useEffect } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { ContactField } from '@/types';

export function ContactFieldRenderer(props: ICellRendererParams) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contacts = props.value as ContactField[];
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  if (!contacts?.length) return <span>-</span>;

  const firstContact = contacts[0];
  const remainingCount = contacts.length - 1;

  if (remainingCount === 0) {
    return <span>{firstContact.value}</span>;
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative flex items-center space-x-2">
      <span>{firstContact.value}</span>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
      >
        +{remainingCount}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden min-w-[256px]"
          style={{
            top: triggerRef.current?.getBoundingClientRect().bottom ?? 0,
            left: triggerRef.current?.getBoundingClientRect().left ?? 0,
          }}
        >
          <div className="px-4 py-2 bg-gray-50 border-b">
            <h3 className="text-sm font-medium text-gray-700">
              {props.colDef.headerName}
            </h3>
          </div>
          <div className="p-2">
            <div className="max-h-48 overflow-y-auto">
              {contacts.map((contact) => (
                <div 
                  key={contact.id}
                  className="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded"
                >
                  {contact.value}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}