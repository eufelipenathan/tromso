import React from 'react';
import { useFormContext } from '@/hooks/form/useFormContext';
import { ChevronDown } from 'lucide-react';

interface BaseSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
}

const BaseSelect: React.FC<BaseSelectProps> = ({
  label,
  error,
  required,
  options,
  className = "",
  ...props
}) => {
  const { styles } = useFormContext();

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <div className="relative">
        <select
          {...props}
          className={`
            ${styles.input}
            ${error ? styles.inputError : ''}
            ${className}
            appearance-none
          `}
        >
          {options.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className={styles.errorMessage}>{error}</p>
      )}
    </div>
  );
};

export default BaseSelect;