import React, { useState, useRef, useEffect } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { ContactField } from '@/types';
import { ChevronDown, X } from 'lucide-react';

export function ContactFieldRenderer(props: ICellRendererParams) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const contacts = props.value as ContactField[];
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);
  
  if (!contacts?.length) return <span>-</span>;

  const firstContact = contacts[0];
  const remainingCount = contacts.length - 1;

  if (remainingCount === 0) {
    return <span>{firstContact.value}</span>;
  }

  return (
    <div className="relative flex items-center space-x-2" ref={containerRef}>
      <span className="truncate">{firstContact.value}</span>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
      >
        <span>+{remainingCount}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && buttonRef.current && (
        <div
          className="fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden min-w-[256px]"
          style={{
            top: buttonRef.current.getBoundingClientRect().bottom + 4,
            left: buttonRef.current.getBoundingClientRect().left,
          }}
        >
          <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">{props.colDef.headerName}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
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