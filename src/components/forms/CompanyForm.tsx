import React, { useState } from 'react';
import { Company } from '@/types';
import Form from '@/components/forms/Form';
import Section from '@/components/forms/Section';
import MultiInput from '@/components/forms/MultiInput';
import ValidationInput from '@/components/forms/ValidationInput';
import AddressForm from '@/components/forms/AddressForm';
import CustomFieldsSection from '@/components/forms/CustomFieldsSection';
import { useCustomFields } from '@/hooks/useCustomFields';

interface CompanyFormProps {
  company?: Company;
  onSubmit: (data: Partial<Company>) => Promise<void>;
  isEditing?: boolean;
}

export function CompanyForm({
  company,
  onSubmit,
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

    await onSubmit(currentCompany);
  };

  return (
    <Form 
      id="company-form"
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
            fieldKey="cnpj"
            maxLength={18}
            placeholder="00.000.000/0000-00"
          />

          <MultiInput
            label="Telefones"
            values={currentCompany.phones || []}
            onChange={(phones) => setCurrentCompany({ ...currentCompany, phones })}
            fieldKey="phone"
            placeholder="(00) 00000-0000"
          />

          <MultiInput
            label="E-mails"
            values={currentCompany.emails || []}
            onChange={(emails) => setCurrentCompany({ ...currentCompany, emails })}
            fieldKey="email"
            placeholder="email@exemplo.com"
          />

          <ValidationInput
            label="Website"
            value={currentCompany.website || ''}
            onChange={(e) => setCurrentCompany({ ...currentCompany, website: e.target.value })}
            fieldKey="website"
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
    </Form>
  );
}

export default CompanyForm;