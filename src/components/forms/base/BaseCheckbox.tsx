import React from 'react';
import { useFormContext } from '@/hooks/form/useFormContext';

interface BaseCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const BaseCheckbox: React.FC<BaseCheckboxProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  const { styles } = useFormContext();

  return (
    <div className={styles.container}>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          {...props}
          className={`
            h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded
            ${className}
          `}
        />
        <span className={styles.label}>{label}</span>
      </label>
      {error && (
        <p className={styles.errorMessage}>{error}</p>
      )}
    </div>
  );
};

export default BaseCheckbox;