import React, { useState, useEffect } from 'react';
import { Contact } from '@/types';
import { useEntityCreation, contactConfig } from '@/lib/entity-management';
import Modal from '../Modal';
import Form from '../forms/Form';
import Button from '../Button';
import Section from '../forms/Section';
import MultiInput from './MultiInput';
import ValidationInput from './ValidationInput';
import CustomFieldsSection from './CustomFieldsSection';
import { useCustomFields } from '@/hooks/useCustomFields';
import { useUI } from '@/hooks/useUI';
import { validateEmail, validatePhone } from '@/utils/validators';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactId: string, contact: Contact) => Promise<void>;
  initialName?: string;
  companyId?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  companyId
}) => {
  console.log('[ContactForm] Render with props:', { isOpen, initialName, companyId });

  const [currentContact, setCurrentContact] = useState<Partial<Contact>>({
    phones: [],
    emails: [],
    customFields: {},
    name: initialName,
    companyId
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { sections, fields, loading: fieldsLoading } = useCustomFields('contact');
  const { startLoading, stopLoading } = useUI();
  const { createEntity } = useEntityCreation<Contact>(contactConfig);

  useEffect(() => {
    console.log('[ContactForm] isOpen changed:', isOpen);
    if (!isOpen) {
      setCurrentContact({
        phones: [],
        emails: [],
        customFields: {},
        name: '',
        companyId: undefined
      });
      setFormErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    console.log('[ContactForm] initialName changed:', initialName);
    if (initialName && isOpen) {
      setCurrentContact(prev => ({
        ...prev,
        name: initialName
      }));
    }
  }, [initialName, isOpen]);

  useEffect(() => {
    console.log('[ContactForm] companyId changed:', companyId);
    if (companyId && isOpen) {
      setCurrentContact(prev => ({
        ...prev,
        companyId
      }));
    }
  }, [companyId, isOpen]);

  const validateForm = () => {
    console.log('[ContactForm] Validating form with data:', currentContact);
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
    const isValid = Object.keys(errors).length === 0 && Object.keys(customFieldsErrors).length === 0;
    console.log('[ContactForm] Form validation result:', { isValid, errors });
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[ContactForm] Submit initiated');
    
    if (!validateForm()) {
      console.log('[ContactForm] Form validation failed');
      return;
    }

    startLoading('save-contact');
    console.log('[ContactForm] Creating contact with data:', currentContact);

    try {
      const result = await createEntity(currentContact);
      console.log('[ContactForm] Contact created:', result);
      
      if (result) {
        console.log('[ContactForm] Calling onSave with contactId:', result.id);
        await onSave(result.id, result.entity);
      }
    } catch (error) {
      console.error('[ContactForm] Error creating contact:', error);
    } finally {
      stopLoading('save-contact');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Contato"
    >
      <Form 
        onSubmit={handleSubmit}
        className="space-y-4"
        loadingKey="save-contact"
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

            <MultiInput
              label="Telefones"
              values={currentContact.phones || []}
              onChange={(phones) => setCurrentContact({ ...currentContact, phones })}
              placeholder="(00) 00000-0000"
            />

            <MultiInput
              label="E-mails"
              values={currentContact.emails || []}
              onChange={(emails) => setCurrentContact({ ...currentContact, emails })}
              placeholder="email@exemplo.com"
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
            onClick={onClose}
            variant="ghost"
            size="lg"
            type="button"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="lg"
            loadingKey="save-contact"
          >
            Salvar
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ContactForm;