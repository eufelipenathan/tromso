import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  hasErrors?: boolean;
}

const Section: React.FC<SectionProps> = ({ 
  title, 
  children, 
  defaultOpen = false,
  hasErrors = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg overflow-hidden mb-4">
      <button
        type="button"
        className={`
          w-full px-4 py-3 flex items-center justify-between transition-colors
          ${hasErrors ? 'bg-red-50 hover:bg-red-100' : 'bg-gray-50 hover:bg-gray-100'}
        `}
        onClick={() => setIsOpen(!isOpen)}
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