import React, { useState } from 'react';
import { Contact } from '@/types';
import Form from '@/components/forms/Form';
import Button from '@/components/Button';
import Section from '@/components/forms/Section';
import MultiInput from '@/components/forms/MultiInput';
import ValidationInput from '@/components/forms/ValidationInput';
import CustomFieldsSection from '@/components/forms/CustomFieldsSection';
import CompanySelect from '@/components/forms/CompanySelect';
import { maskPhone } from '@/utils/masks';
import { validateEmail, validatePhone } from '@/utils/validators';
import { useCustomFields } from '@/hooks/useCustomFields';

interface ContactFormProps {
  contact?: Contact;
  onSubmit: (data: Partial<Contact>) => Promise<void>;
  onCancel: () => void;
  onCompanyCreate: (name: string) => void;
  companies: any[];
  isEditing?: boolean;
}

export function ContactForm({
  contact,
  onSubmit,
  onCancel,
  onCompanyCreate,
  companies,
  isEditing = false
}: ContactFormProps) {
  const [currentContact, setCurrentContact] = useState<Partial<Contact>>(
    contact || {
      phones: [],
      emails: [],
      customFields: {}
    }
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { sections, fields, loading: fieldsLoading } = useCustomFields('contact');

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!currentContact.name?.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!currentContact.companyId) {
      errors.companyId = 'Empresa é obrigatória';
    }

    if (currentContact.phones?.some(phone => !validatePhone(phone.value))) {
      errors.phones = 'Um ou mais telefones são inválidos';
    }

    if (currentContact.emails?.some(email => !validateEmail(email.value))) {
      errors.emails = 'Um ou mais e-mails são inválidos';
    }

    const customFieldsErrors = fields.reduce((acc, field) => {
      if (field.required && !currentContact.customFields?.[field.id]) {
        acc[`customFields.${field.id}`] = 'Campo obrigatório';
      }
      return acc;
    }, {} as Record<string, string>);

    setFormErrors({ ...errors, ...customFieldsErrors });
    return Object.keys(errors).length === 0 && Object.keys(customFieldsErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(currentContact);
  };

  return (
    <Form 
      onSubmit={handleSubmit}
      className="space-y-4"
      loadingKey={isEditing ? `edit-contact-${contact?.id}` : 'new-contact'}
    >
      <Section title="Informações Básicas" defaultOpen>
        <div className="grid grid-cols-1 gap-4">
          <ValidationInput
            label="Nome"
            value={currentContact.name || ''}
            onChange={(e) => setCurrentContact({ ...currentContact, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <CompanySelect
            value={currentContact.companyId || ''}
            onChange={(companyId) => setCurrentContact(prev => ({ ...prev, companyId }))}
            companies={companies}
            onCreateClick={onCompanyCreate}
          />

          <MultiInput
            label="Telefones"
            values={currentContact.phones || []}
            onChange={(phones) => setCurrentContact({ ...currentContact, phones })}
            validate={validatePhone}
            mask={maskPhone}
            placeholder="(00) 00000-0000"
            fieldType="phone"
          />

          <MultiInput
            label="E-mails"
            values={currentContact.emails || []}
            onChange={(emails) => setCurrentContact({ ...currentContact, emails })}
            validate={validateEmail}
            placeholder="email@exemplo.com"
            fieldType="email"
          />
        </div>
      </Section>

      {!fieldsLoading && (
        <CustomFieldsSection
          sections={sections}
          fields={fields}
          values={currentContact.customFields || {}}
          onChange={(customFields) => setCurrentContact({ ...currentContact, customFields })}
          errors={formErrors}
        />
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          onClick={onCancel}
          variant="ghost"
          size="lg"
          type="button"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="lg"
          loadingKey={isEditing ? `edit-contact-${contact?.id}` : 'new-contact'}
        >
          Salvar
        </Button>
      </div>
    </Form>
  );
}