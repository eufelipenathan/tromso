import { useMemo } from 'react';
import { FormStyles } from '../types';

export function useFormStyles(): FormStyles {
  return useMemo(
    () => ({
      container: 'space-y-1',
      label: 'block text-sm font-medium text-gray-700',
      required: 'text-red-500 ml-1',
      input: `
        block w-full rounded-md border border-gray-300 shadow-sm text-sm h-12 px-4
        focus:border-blue-500 focus:ring-blue-500
      `,
      inputError: 'border-red-300 focus:border-red-500 focus:ring-red-500',
      errorIcon: 'absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500',
      errorMessage: 'text-sm text-red-600',
    }),
    []
  );
}