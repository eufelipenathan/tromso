import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { ContactField } from '../types';
import { validateEmail, validatePhone } from '../utils/validators';
import { maskPhone } from '../utils/masks';

interface MultiInputProps {
  label: string;
  values: ContactField[];
  onChange: (values: ContactField[]) => void;
  fieldType?: 'phone' | 'email';
  placeholder?: string;
}

const MultiInput: React.FC<MultiInputProps> = ({
  label,
  values,
  onChange,
  fieldType,
  placeholder,
}) => {
  const [currentValue, setCurrentValue] = useState('');
  const [error, setError] = useState('');

  const validate = (value: string) => {
    if (fieldType === 'phone' && !validatePhone(value)) {
      return 'Telefone inválido';
    }
    if (fieldType === 'email' && !validateEmail(value)) {
      return 'E-mail inválido';
    }
    return '';
  };

  const handleAdd = () => {
    if (!currentValue) return;

    const validationError = validate(currentValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (values.some(field => field.value.toLowerCase() === currentValue.toLowerCase())) {
      setError(`Este ${fieldType === 'phone' ? 'telefone' : 'e-mail'} já foi adicionado`);
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

  const handleChange = (value: string) => {
    setError('');
    const maskedValue = fieldType === 'phone' ? maskPhone(value) : value;
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
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="flex gap-2">
        <input
          type="text"
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 h-12 px-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center px-4 h-12 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-2">
        {values.map((field) => (
          <div
            key={field.id}
            className="flex items-center gap-2 bg-gray-50 p-3 rounded-md"
          >
            <span className="flex-1 text-base">{field.value}</span>
            <button
              type="button"
              onClick={() => onChange(values.filter(v => v.id !== field.id))}
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