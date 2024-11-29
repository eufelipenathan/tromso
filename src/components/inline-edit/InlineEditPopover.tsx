import React from 'react';
import InlineInput from './InlineInput';
import Button from '@/components/Button';
import { useInlineStyles } from './styles/useInlineStyles';

interface InlineEditPopoverProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  validate?: (value: string) => { isValid: boolean; error?: string };
  mask?: (value: string) => string;
  required?: boolean;
  type?: string;
  error?: string;
  hasMask?: boolean;
}

const InlineEditPopover: React.FC<InlineEditPopoverProps> = ({
  label,
  value,
  onChange,
  onSave,
  onCancel,
  onKeyDown,
  validate,
  mask,
  required,
  type = 'text',
  error,
  hasMask
}) => {
  const styles = useInlineStyles();

  return (
    <div className={styles.popover.container}>
      <div className={styles.popover.header}>
        <span className={styles.popover.label}>
          Editar {label}
          {hasMask && <span className={styles.popover.maskIndicator}>🎭</span>}
        </span>
      </div>
      
      <InlineInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onValidate={validate}
        mask={mask}
        required={required}
        type={type}
        error={error}
        autoFocus
        className="h-7"
      />

      <div className={styles.popover.actions}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className={styles.popover.button}
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          className={styles.popover.button}
        >
          Salvar
        </Button>
      </div>
    </div>
  );
};

export default InlineEditPopover;