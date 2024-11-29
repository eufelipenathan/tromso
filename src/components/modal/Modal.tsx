import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ModalProvider } from './ModalContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl'
};

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  footer,
  size = '3xl'
}) => {
  console.log('[Modal] Render:', { isOpen, title, size });
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('[Modal] Effect: isOpen changed:', isOpen);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalProvider>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity" 
            onClick={() => {
              console.log('[Modal] Backdrop clicked');
              onClose();
            }}
          />

          {/* Modal */}
          <div className={`
            relative w-full ${sizeClasses[size]} transform 
            rounded-lg bg-white shadow-xl transition-all
            flex flex-col max-h-[calc(100vh-2rem)]
          `}>
            {/* Header - Fixed */}
            <div className="flex-shrink-0 flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={() => {
                  console.log('[Modal] Close button clicked');
                  onClose();
                }}
                className="rounded-md p-1 text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div 
              ref={contentRef}
              className="flex-1 overflow-y-auto p-6"
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                console.log('[Modal] Content scrolled:', {
                  scrollTop: target.scrollTop,
                  scrollHeight: target.scrollHeight,
                  clientHeight: target.clientHeight
                });
              }}
            >
              {children}
            </div>

            {/* Footer - Fixed */}
            {footer && (
              <div className="flex-shrink-0 border-t px-6 py-4 bg-white">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalProvider>
  );
};

export default Modal;