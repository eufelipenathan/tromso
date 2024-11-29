import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  hasErrors?: boolean;
  onOpen?: () => void;
}

const Section: React.FC<SectionProps> = ({ 
  title, 
  children, 
  defaultOpen,
  hasErrors,
  onOpen
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? title === 'Informações Básicas');
  const sectionRef = useRef<HTMLDivElement>(null);

  // Expande a seção automaticamente se houver erros
  React.useEffect(() => {
    if (hasErrors && !isOpen) {
      setIsOpen(true);
      onOpen?.();
      
      // Scroll para a seção
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [hasErrors, isOpen, onOpen]);

  return (
    <div ref={sectionRef} className="border rounded-lg overflow-hidden mb-4">
      <button
        type="button"
        className={`
          w-full px-4 py-3 flex items-center justify-between transition-colors
          ${hasErrors ? 'bg-red-50 hover:bg-red-100' : 'bg-gray-50 hover:bg-gray-100'}
        `}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            onOpen?.();
          }
        }}
      >
        <span className={`
          text-sm font-medium
          ${hasErrors ? 'text-red-900' : 'text-gray-900'}
        `}>
          {title}
          {hasErrors && <span className="ml-2 text-red-600">(campos obrigatórios)</span>}
        </span>
        {isOpen ? (
          <ChevronUp className={`h-5 w-5 ${hasErrors ? 'text-red-500' : 'text-gray-500'}`} />
        ) : (
          <ChevronDown className={`h-5 w-5 ${hasErrors ? 'text-red-500' : 'text-gray-500'}`} />
        )}
      </button>
      {isOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

export default Section;