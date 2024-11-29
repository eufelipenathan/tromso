import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

interface PipelineButtonProps {
  id: string;
  name: string;
  icon?: string;
  isActive?: boolean;
}

const PipelineButton: React.FC<PipelineButtonProps> = ({
  id,
  name,
  icon = 'Banknote',
  isActive = false
}) => {
  const Icon = Icons[icon as keyof typeof Icons] || Icons.Banknote;

  return (
    <Link
      to={`/deals?pipeline=${id}`}
      className={`
        inline-flex items-center px-2 py-1 text-sm font-medium rounded-md transition-colors
        ${isActive 
          ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
      `}
    >
      <Icon className="h-4 w-4 mr-1.5" />
      <span>{name}</span>
    </Link>
  );
};

export default PipelineButton;