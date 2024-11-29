import React from 'react';
import { XCircle } from 'lucide-react';

interface ValidationInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const ValidationInput: React.FC<ValidationInputProps> = ({
  label,
  error,
  required,
  className = "",
  ...props
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          {...props}
          className={`
            block w-full rounded-md border shadow-sm text-sm h-12 px-4
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
            ${className}
          `}
        />
        {error && (
          <XCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ValidationInput;