import React, { useState } from 'react';
import { Company } from '@/types';
import Form from '@/components/forms/Form';
import Button from '@/components/Button';
import Section from '@/components/forms/Section';
import MultiInput from '@/components/forms/MultiInput';
import ValidationInput from '@/components/forms/ValidationInput';
import AddressForm from '@/components/forms/AddressForm';
import CustomFieldsSection from '@/components/forms/CustomFieldsSection';
import { maskCNPJ, maskPhone } from '@/utils/masks';
import { validateEmail, validatePhone } from '@/utils/validators';
import { useCustomFields } from '@/hooks/useCustomFields';

interface CompanyFormProps {
  company?: Company;
  onSubmit: (data: Partial<Company>) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export function CompanyForm({
  company,
  onSubmit,
  onCancel,
  isEditing = false
}: CompanyFormProps) {
  const [currentCompany, setCurrentCompany] = useState<Partial<Company>>(
    company || {
      phones: [],
      emails: [],
      address: {
        cep: '',
        street: '',
        number: '',
        district: '',
        city: '',
        state: '',
      },
      customFields: {}
    }
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { sections, fields, loading: fieldsLoading } = useCustomFields('company');

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!currentCompany.name?.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (currentCompany.cnpj && !validateCNPJ(currentCompany.cnpj)) {
      errors.cnpj = 'CNPJ inválido';
    }

    if (currentCompany.phones?.some(phone => !validatePhone(phone.value))) {
      errors.phones = 'Um ou mais telefones são inválidos';
    }

    if (currentCompany.emails?.some(email => !validateEmail(email.value))) {
      errors.emails = 'Um ou mais e-mails são inválidos';
    }

    const customFieldsErrors = fields.reduce((acc, field) => {
      if (field.required && !currentCompany.customFields?.[field.id]) {
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

    // Mantém o ID se estiver editando
    const dataToSubmit = isEditing ? { ...currentCompany, id: company?.id } : currentCompany;
    await onSubmit(dataToSubmit);
  };

  return (
    <Form 
      onSubmit={handleSubmit}
      className="space-y-4"
      loadingKey={isEditing ? `edit-company-${company?.id}` : 'new-company'}
    >
      <Section title="Informações Básicas" defaultOpen>
        <div className="grid grid-cols-1 gap-4">
          <ValidationInput
            label="Nome"
            value={currentCompany.name || ''}
            onChange={(e) => setCurrentCompany({ ...currentCompany, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <ValidationInput
            label="Razão Social"
            value={currentCompany.legalName || ''}
            onChange={(e) => setCurrentCompany({ ...currentCompany, legalName: e.target.value })}
            error={formErrors.legalName}
          />

          <ValidationInput
            label="CNPJ"
            value={currentCompany.cnpj || ''}
            onChange={(e) => setCurrentCompany({ ...currentCompany, cnpj: e.target.value })}
            error={formErrors.cnpj}
            mask={maskCNPJ}
            maxLength={18}
            placeholder="00.000.000/0000-00"
          />

          <MultiInput
            label="Telefones"
            values={currentCompany.phones || []}
            onChange={(phones) => setCurrentCompany({ ...currentCompany, phones })}
            validate={validatePhone}
            mask={maskPhone}
            placeholder="(00) 00000-0000"
            fieldType="phone"
          />

          <MultiInput
            label="E-mails"
            values={currentCompany.emails || []}
            onChange={(emails) => setCurrentCompany({ ...currentCompany, emails })}
            validate={validateEmail}
            placeholder="email@exemplo.com"
            fieldType="email"
          />

          <ValidationInput
            label="Website"
            value={currentCompany.website || ''}
            onChange={(e) => setCurrentCompany({ ...currentCompany, website: e.target.value })}
            placeholder="exemplo.com"
          />
        </div>
      </Section>

      <Section title="Endereço">
        <AddressForm
          value={currentCompany.address!}
          onChange={(address) => setCurrentCompany({ ...currentCompany, address })}
          errors={formErrors}
        />
      </Section>

      {!fieldsLoading && (
        <CustomFieldsSection
          sections={sections}
          fields={fields}
          values={currentCompany.customFields || {}}
          onChange={(customFields) => setCurrentCompany({ ...currentCompany, customFields })}
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
          loadingKey={isEditing ? `edit-company-${company?.id}` : 'new-company'}
        >
          Salvar
        </Button>
      </div>
    </Form>
  );
}