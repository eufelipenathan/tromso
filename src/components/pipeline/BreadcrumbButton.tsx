import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

interface BreadcrumbButtonProps {
  to?: string;
  icon?: keyof typeof Icons;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const BreadcrumbButton: React.FC<BreadcrumbButtonProps> = ({
  to,
  icon,
  onClick,
  children,
  className = ''
}) => {
  const Icon = icon ? Icons[icon] : undefined;
  const baseClasses = `
    inline-flex items-center px-2 py-1 text-sm font-medium 
    text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 
    border border-gray-200 rounded-md transition-colors
    ${className}
  `;

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        {Icon && <Icon className="h-4 w-4 mr-1.5" />}
        <span className="truncate">{children}</span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {Icon && <Icon className="h-4 w-4 mr-1.5" />}
      <span className="truncate">{children}</span>
    </button>
  );
};

export default BreadcrumbButton;