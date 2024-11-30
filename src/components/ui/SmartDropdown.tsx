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
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const open = controlledIsOpen ?? isOpen;

  const handleIsOpen = (value: boolean) => {
    setIsOpen(value);
    onOpenChange?.(value);
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !dropdownRef.current) return null;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let top = 0;
    let left = 0;

    // Calculate horizontal position
    if (placement.startsWith('left')) {
      left = triggerRect.left - dropdownRect.width - offset;
      if (left < 0) {
        // Not enough space on the left, try right side
        left = triggerRect.right + offset;
        if (left + dropdownRect.width > viewportWidth) {
          // Not enough space on either side, center horizontally
          left = Math.max(0, (viewportWidth - dropdownRect.width) / 2);
        }
      }
    } else {
      left = triggerRect.right + offset;
      if (left + dropdownRect.width > viewportWidth) {
        // Not enough space on the right, try left side
        left = triggerRect.left - dropdownRect.width - offset;
        if (left < 0) {
          // Not enough space on either side, center horizontally
          left = Math.max(0, (viewportWidth - dropdownRect.width) / 2);
        }
      }
    }

    // Calculate vertical position
    if (placement.endsWith('start')) {
      top = triggerRect.top;
      if (top + dropdownRect.height > viewportHeight) {
        // Not enough space below, try above
        top = Math.max(0, triggerRect.bottom - dropdownRect.height);
      }
    } else {
      top = triggerRect.bottom - dropdownRect.height;
      if (top < 0) {
        // Not enough space above, try below
        top = Math.min(triggerRect.top, viewportHeight - dropdownRect.height);
      }
    }

    // Add scroll offset
    top += window.scrollY;
    left += window.scrollX;

    return { top, left };
  };

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    // Calculate initial position
    const newPosition = calculatePosition();
    if (newPosition) {
      setPosition(newPosition);
    }

    const handleScroll = () => {
      const newPosition = calculatePosition();
      if (newPosition) {
        setPosition(newPosition);
      }
    };

    const handleResize = () => {
      const newPosition = calculatePosition();
      if (newPosition) {
        setPosition(newPosition);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
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

      {open && position && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            width: width,
            zIndex: 9999,
            opacity: position ? 1 : 0,
            transition: 'opacity 150ms ease-out'
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