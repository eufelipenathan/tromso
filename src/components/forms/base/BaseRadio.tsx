import React from 'react';
import { useFormContext } from '@/hooks/form/useFormContext';

interface BaseRadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

const BaseRadio: React.FC<BaseRadioProps> = ({
  label,
  error,
  options,
  className = "",
  name,
  ...props
}) => {
  const { styles } = useFormContext();

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <div className="space-y-2 mt-1">
        {options.map(({ value, label }) => (
          <label key={value} className="flex items-center space-x-2">
            <input
              type="radio"
              {...props}
              name={name}
              value={value}
              className={`
                h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300
                ${className}
              `}
            />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className={styles.errorMessage}>{error}</p>
      )}
    </div>
  );
};

export default BaseRadio;