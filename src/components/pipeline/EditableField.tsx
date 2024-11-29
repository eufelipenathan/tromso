import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { SmartDropdown } from '@/components/ui/SmartDropdown';
import InlineEditPopover from '../inline-edit/InlineEditPopover';

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<boolean>;
  validate?: (value: string) => { isValid: boolean; error?: string };
  mask?: (value: string) => string;
  required?: boolean;
  type?: string;
  fieldKey?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onSave,
  validate,
  mask,
  required,
  type = 'text',
  fieldKey
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string>();

  const getFieldValidator = () => {
    if (validate) return validate;
    return undefined;
  };

  const getFieldMask = () => {
    if (mask) return mask;
    return undefined;
  };

  const hasMask = Boolean(getFieldMask());

  const validateField = () => {
    setError(undefined);

    if (required && !editValue.trim()) {
      setError('Campo obrigatório');
      return false;
    }

    if (!required && !editValue.trim()) {
      return true;
    }

    const fieldValidator = getFieldValidator();
    if (fieldValidator && editValue.trim()) {
      const result = fieldValidator(editValue);
      if (!result.isValid) {
        setError(result.error || 'Valor inválido');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateField()) return;

    try {
      const success = await onSave(editValue);
      if (success) {
        setIsEditing(false);
        setError(undefined);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro ao salvar. Tente novamente.');
      }
      setEditValue(value);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setError(undefined);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="space-y-0.5 min-w-0 group">
      <dt className="text-[11px] text-gray-500 flex items-center justify-between">
        <span>{label}</span>
        <SmartDropdown
          isOpen={isEditing}
          onOpenChange={setIsEditing}
          trigger={
            <button 
              className="p-1 rounded-md text-gray-300 hover:text-gray-400 hover:bg-gray-100 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3 w-3" />
            </button>
          }
          placement="left-start"
          offset={8}
          width={256}
        >
          <InlineEditPopover
            label={label}
            value={editValue}
            onChange={setEditValue}
            onSave={handleSave}
            onCancel={handleCancel}
            onKeyDown={handleKeyDown}
            validate={getFieldValidator()}
            mask={getFieldMask()}
            required={required}
            type={type}
            error={error}
            hasMask={hasMask}
          />
        </SmartDropdown>
      </dt>
      <dd 
        className="text-xs text-gray-900 truncate"
        title={value || undefined}
      >
        {value || '-'}
      </dd>
    </div>
  );
};

export default EditableField;