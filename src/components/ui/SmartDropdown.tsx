import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Position {
  top: number;
  left: number;
}

interface SmartDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  placement?: 'left-start' | 'left-end' | 'right-start' | 'right-end';
  offset?: number;
  width?: number;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

interface SmartDropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}

interface SmartDropdownSeparatorProps {
  className?: string;
}

export function SmartDropdown({
  trigger,
  children,
  className = '',
  placement = 'left-start',
  offset = 8,
  width,
  isOpen: controlledIsOpen,
  onOpenChange
}: SmartDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const open = controlledIsOpen ?? isOpen;

  const handleIsOpen = (value: boolean) => {
    setIsOpen(value);
    onOpenChange?.(value);
  };

  useEffect(() => {
    if (!open || !triggerRef.current || !dropdownRef.current) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current?.getBoundingClientRect();
      const dropdownRect = dropdownRef.current?.getBoundingClientRect();
      
      if (!triggerRect || !dropdownRect) return;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = 0;
      let left = 0;

      // Posicionamento vertical
      if (placement.includes('start')) {
        top = triggerRect.top;
      } else {
        top = triggerRect.bottom - dropdownRect.height;
      }

      // Garante que o popover não ultrapasse os limites verticais da viewport
      if (top + dropdownRect.height > viewportHeight) {
        top = viewportHeight - dropdownRect.height - offset;
      }
      if (top < 0) {
        top = offset;
      }

      // Posicionamento horizontal (sempre à esquerda do trigger)
      left = triggerRect.left - dropdownRect.width - offset;

      // Se não houver espaço à esquerda, tenta posicionar à direita
      if (left < 0) {
        left = triggerRect.right + offset;
        
        // Se também não houver espaço à direita, posiciona onde houver mais espaço
        if (left + dropdownRect.width > viewportWidth) {
          const spaceLeft = triggerRect.left;
          const spaceRight = viewportWidth - triggerRect.right;
          
          if (spaceLeft > spaceRight) {
            left = offset;
          } else {
            left = viewportWidth - dropdownRect.width - offset;
          }
        }
      }

      // Adiciona scroll offset
      top += window.scrollY;
      left += window.scrollX;

      setPosition({ top, left });
    };

    updatePosition();

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, placement, offset]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        triggerRef.current &&
        dropdownRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        handleIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <>
      <div 
        ref={triggerRef} 
        onClick={() => handleIsOpen(!open)}
        className="inline-flex"
      >
        {trigger}
      </div>

      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            width: width,
            zIndex: 9999
          }}
          className={className}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
}

export function SmartDropdownItem({
  children,
  variant = 'default',
  className = '',
  ...props
}: SmartDropdownItemProps) {
  const baseClasses = "w-full px-4 py-2 text-sm text-left flex items-center space-x-2 transition-colors";
  const variantClasses = {
    default: "text-gray-700 hover:bg-gray-100",
    danger: "text-red-600 hover:bg-red-50"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SmartDropdownSeparator({ className = '' }: SmartDropdownSeparatorProps) {
  return (
    <div className={`h-px bg-gray-200 my-1 ${className}`} />
  );
}