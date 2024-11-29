import React from 'react';
import { Edit2 } from 'lucide-react';
import { SmartDropdown } from '@/components/ui/SmartDropdown';
import InlineEditPopover from './InlineEditPopover';
import { useInlineEdit } from '@/hooks/useInlineEdit';

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
  const {
    isEditing,
    editValue,
    error,
    startEditing,
    setEditValue,
    handleSave,
    handleCancel
  } = useInlineEdit({
    onSave,
    validate,
    required
  });

  const hasMask = Boolean(mask);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave(editValue!, value);
    }
  };

  return (
    <div className="space-y-0.5 min-w-0 group">
      <dt className="text-[11px] text-gray-500 flex items-center justify-between">
        <span>{label}</span>
        <SmartDropdown
          isOpen={isEditing}
          onOpenChange={(open) => {
            if (open) {
              startEditing(value);
            } else {
              handleCancel();
            }
          }}
          trigger={
            <button 
              className="p-1 rounded-md text-gray-300 hover:text-gray-400 hover:bg-gray-100 transition-colors"
              onClick={() => startEditing(value)}
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
            value={editValue || ''}
            onChange={setEditValue}
            onSave={() => handleSave(editValue!, value)}
            onCancel={handleCancel}
            onKeyDown={handleKeyDown}
            validate={validate}
            mask={mask}
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