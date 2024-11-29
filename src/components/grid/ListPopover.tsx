import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { ContactField } from '@/types';

interface ListPopoverProps {
  items: ContactField[];
  maxVisible?: number;
  title?: string;
}

const ListPopover: React.FC<ListPopoverProps> = ({ 
  items = [], 
  maxVisible = 1,
  title = 'Itens'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  if (!items?.length) return <>-</>;
  if (items.length <= maxVisible) return <>{items.map(item => item.value).join(', ')}</>;

  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        triggerRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const updatePosition = () => {
      if (isOpen && triggerRef.current && popoverRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        let top = triggerRect.bottom + 8;
        let left = triggerRect.left;

        if (top + popoverRect.height > viewportHeight) {
          top = triggerRect.top - popoverRect.height - 8;
        }

        if (left + popoverRect.width > viewportWidth) {
          left = triggerRect.right - popoverRect.width;
        }

        if (left < 0) {
          left = 8;
        }

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

        setPosition({
          top: top + scrollTop,
          left: left + scrollLeft
        });
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      updatePosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <div className="flex items-center space-x-1">
        <span>{visibleItems.map(item => item.value).join(', ')}</span>
        <button
          ref={triggerRef}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
        >
          +{remainingCount}
        </button>
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed z-50 w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`
          }}
        >
          <div className="px-4 py-2 bg-gray-50 border-b">
            <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          </div>
          <div className="p-2">
            <div className="max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded"
                >
                  {item.value}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPopover;