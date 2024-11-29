import React from 'react';
import { useFormContext } from '@/hooks/form/useFormContext';
import { XCircle } from 'lucide-react';

interface BaseInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'validate'> {
  label: string;
  error?: string;
  required?: boolean;
  mask?: (value: string) => string;
  validate?: (value: string) => { isValid: boolean; error?: string };
}

const BaseInput: React.FC<BaseInputProps> = ({
  label,
  error,
  required,
  mask,
  validate,
  onChange,
  onBlur,
  className = "",
  value = "",
  ...props
}) => {
  const { styles } = useFormContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mask) {
      const maskedValue = mask(e.target.value);
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: maskedValue
        }
      };
      onChange?.(syntheticEvent);
    } else {
      onChange?.(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (validate) {
      const result = validate(e.target.value);
      if (!result.isValid) {
        // Handle validation error
      }
    }
    onBlur?.(e);
  };

  // Separate DOM props from custom props
  const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
    ...props,
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    className: `
      ${styles.input}
      ${error ? styles.inputError : ''}
      ${className}
    `.trim()
  };

  // Remove custom props that shouldn't be passed to DOM
  delete (inputProps as any).validate;
  delete (inputProps as any).mask;

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <div className="relative">
        <input {...inputProps} />
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

export default BaseInput;