import React from 'react';
import BaseInput from './base/BaseInput';
import { getFieldValidator } from '@/lib/form-validation';

interface ValidationInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  fieldKey?: string;
  required?: boolean;
}

const ValidationInput: React.FC<ValidationInputProps> = ({
  label,
  error,
  fieldKey,
  required,
  ...props
}) => {
  const fieldValidator = getFieldValidator(fieldKey);

  return (
    <BaseInput
      label={label}
      error={error}
      required={required}
      validate={fieldValidator?.validate}
      mask={fieldValidator?.mask}
      {...props}
    />
  );
};

export default ValidationInput;