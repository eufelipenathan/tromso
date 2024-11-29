import React, { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { getFieldValidator } from '@/lib/form-validation';
import { useFormStyles } from './styles/useFormStyles';
import { ContactField } from '@/types';

interface MultiInputProps {
  label: string;
  values: ContactField[];
  onChange: (values: ContactField[]) => void;
  fieldKey?: string;
  fieldType?: 'phone' | 'email';
  placeholder?: string;
}

const MultiInput: React.FC<MultiInputProps> = ({
  label,
  values,
  onChange,
  fieldKey,
  fieldType,
  placeholder,
}) => {
  const [currentValue, setCurrentValue] = useState('');
  const [error, setError] = useState('');
  const styles = useFormStyles();
  const fieldValidator = getFieldValidator(fieldKey);

  const handleAdd = () => {
    if (!currentValue) return;

    if (fieldValidator) {
      const result = fieldValidator.validate(currentValue);
      if (!result.isValid) {
        setError(result.error || 'Valor inválido');
        return;
      }
    }

    // Check for duplicates with custom messages
    if (values.some(field => field.value.toLowerCase() === currentValue.toLowerCase())) {
      if (fieldType === 'phone') {
        setError('Este telefone já foi adicionado');
      } else if (fieldType === 'email') {
        setError('Este e-mail já foi adicionado');
      } else {
        setError('Este valor já foi adicionado');
      }
      return;
    }

    const newField: ContactField = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      value: currentValue,
      createdAt: new Date()
    };

    onChange([...values, newField]);
    setCurrentValue('');
    setError('');
  };

  const handleRemove = (id: string) => {
    onChange(values.filter(field => field.id !== id));
  };

  const handleChange = (value: string) => {
    setError('');
    const maskedValue = fieldValidator?.mask
      ? fieldValidator.mask(value)
      : value;
    setCurrentValue(maskedValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <label className={styles.label}>{label}</label>

      <div className="flex gap-2">
        <input
          type="text"
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className={`${styles.input} flex-1`}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center px-4 h-12 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {error && <p className={styles.errorMessage}>{error}</p>}

      <div className="space-y-2">
        {values.map((field) => (
          <div
            key={field.id}
            className="flex items-center gap-2 bg-gray-50 p-3 rounded-md"
          >
            <span className="flex-1 text-base">{field.value}</span>
            <button
              type="button"
              onClick={() => handleRemove(field.id)}
              className="text-gray-400 hover:text-red-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiInput;