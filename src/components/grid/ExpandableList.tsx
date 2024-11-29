import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ContactField } from '@/types';

interface ExpandableListProps {
  items: ContactField[];
  maxVisible?: number;
}

const ExpandableList: React.FC<ExpandableListProps> = ({ 
  items = [], 
  maxVisible = 1 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!items?.length) return <>-</>;
  if (items.length <= maxVisible) return <>{items.map(item => item.value).join(', ')}</>;

  const visibleItems = isExpanded ? items : items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;

  return (
    <div className="flex items-center space-x-1">
      <span>{visibleItems.map(item => item.value).join(', ')}</span>
      {!isExpanded && remainingCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
          }}
          className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
        >
          +{remainingCount}
        </button>
      )}
      {isExpanded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(false);
          }}
          className="inline-flex items-center justify-center w-5 h-5 text-blue-600 hover:text-blue-800"
        >
          <ChevronDown className="h-4 w-4 transform rotate-180" />
        </button>
      )}
    </div>
  );
};

export default ExpandableList;