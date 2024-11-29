import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  fullPage?: boolean;
  container?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  fullPage = false,
  container = false,
  className = '',
  title = 'Carregando...',
  description
}) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
          {description && (
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
    );
  }

  if (container) {
    return (
      <div className={`w-full flex flex-col items-center justify-center ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
    </div>
  );
};

export default LoadingState;