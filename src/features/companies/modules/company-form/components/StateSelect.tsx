import React from 'react';
import { brazilianStates } from '../constants/states';

interface StateSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function StateSelect({ label, error, className = '', ...props }: StateSelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`
          block w-full h-12 px-4 rounded-md border shadow-sm text-base
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }
          ${className}
        `}
      >
        <option value="">Selecione o Estado</option>
        {brazilianStates.map(state => (
          <option key={state.value} value={state.value}>
            {state.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}