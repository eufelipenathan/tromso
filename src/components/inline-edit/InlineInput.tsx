import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { useInlineStyles } from './styles/useInlineStyles';

interface InlineInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  onValidate?: (value: string) => { isValid: boolean; error?: string };
  mask?: (value: string) => string;
}

const InlineInput: React.FC<InlineInputProps> = ({
  error,
  onValidate,
  mask,
  onChange,
  onBlur,
  className = "",
  value = "",
  ...props
}) => {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string>();
  const styles = useInlineStyles();

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
    setTouched(true);
    if (onValidate) {
      const result = onValidate(e.target.value);
      if (!result.isValid) {
        setLocalError(result.error);
      } else {
        setLocalError(undefined);
      }
    }
    onBlur?.(e);
  };

  const showError = touched && (error || localError);

  return (
    <div className={styles.container}>
      <input
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`
          ${styles.input}
          ${showError ? styles.inputError : ''}
          ${className}
        `}
      />
      {showError && (
        <XCircle className={styles.errorIcon} />
      )}
      {showError && (
        <p className={styles.errorMessage}>{error || localError}</p>
      )}
    </div>
  );
};

export default InlineInput;