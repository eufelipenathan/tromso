import { useMemo } from 'react';
import { InlineStyles } from '../types';

export function useInlineStyles(): InlineStyles {
  return useMemo(() => ({
    container: 'relative',
    input: `
      block w-full rounded border border-gray-300 shadow-sm text-xs px-2 py-1.5
      focus:border-blue-500 focus:ring-blue-500
    `,
    inputError: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    errorIcon: 'absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-red-500',
    errorMessage: 'mt-1 text-xs text-red-600',
    popover: {
      container: 'bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 p-3 w-64',
      header: 'flex items-center justify-between mb-1',
      label: 'text-xs font-medium text-gray-700',
      maskIndicator: 'ml-1 text-gray-400',
      actions: 'flex justify-end space-x-2 mt-3',
      button: 'h-6 text-xs px-2'
    }
  }), []);
}