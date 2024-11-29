import React from 'react';
import { useFormContext } from '@/hooks/form/useFormContext';
import { XCircle } from 'lucide-react';

interface BaseTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

const BaseTextarea: React.FC<BaseTextareaProps> = ({
  label,
  error,
  required,
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
        <textarea
          {...props}
          className={`
            ${styles.input}
            ${error ? styles.inputError : ''}
            ${className}
            resize-none
          `}
        />
        {error && (
          <XCircle className={styles.errorIcon} />
        )}
      </div>
      {error && (
        <p className={styles.errorMessage}>{error}</p>
      )}
    </div>
  );
};

export default BaseTextarea;