import React from 'react';
import { Company } from '@/types';
import { useCompanyForm } from './hooks/useCompanyForm';
import { FormProvider } from '@/hooks/form';
import Section from '@/components/forms/Section';
import ValidationInput from '@/components/forms/ValidationInput';
import MultiInput from '@/components/forms/MultiInput';
import { StateSelect } from './components/StateSelect';

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
  console.log('[CompanyForm] Render:', { isEditing, hasCompany: !!company });

  const {
    formData,
    formErrors,
    touchedFields,
    handleChange,
    handleBlur,
    handleAddressChange,
    handleAddressBlur,
    handleSubmit,
    handleCancel
  } = useCompanyForm({
    initialData: company,
    onSave: onSubmit,
    onCancel
  });

  return (
    <FormProvider initialData={formData}>
      <form onSubmit={handleSubmit} id="company-form" className="space-y-4">
        <Section title="Informações Básicas" defaultOpen>
          <div className="grid grid-cols-1 gap-4">
            <ValidationInput
              label="Nome"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              error={touchedFields.name ? formErrors.name : undefined}
              required
            />

            <ValidationInput
              label="Razão Social"
              value={formData.legalName || ''}
              onChange={(e) => handleChange('legalName', e.target.value)}
              onBlur={() => handleBlur('legalName')}
              error={touchedFields.legalName ? formErrors.legalName : undefined}
            />

            <ValidationInput
              label="CNPJ"
              value={formData.cnpj || ''}
              onChange={(e) => handleChange('cnpj', e.target.value)}
              onBlur={() => handleBlur('cnpj')}
              error={touchedFields.cnpj ? formErrors.cnpj : undefined}
              fieldKey="cnpj"
            />

            <MultiInput
              label="Telefones"
              values={formData.phones || []}
              onChange={(phones) => handleChange('phones', phones)}
              fieldKey="phone"
              placeholder="(00) 00000-0000"
              error={touchedFields.phones ? formErrors.phones : undefined}
            />

            <MultiInput
              label="E-mails"
              values={formData.emails || []}
              onChange={(emails) => handleChange('emails', emails)}
              fieldKey="email"
              placeholder="email@exemplo.com"
              error={touchedFields.emails ? formErrors.emails : undefined}
            />

            <ValidationInput
              label="Website"
              value={formData.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              onBlur={() => handleBlur('website')}
              error={touchedFields.website ? formErrors.website : undefined}
              fieldKey="website"
            />
          </div>
        </Section>

        <Section title="Endereço">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ValidationInput
              label="CEP"
              value={formData.address?.cep || ''}
              onChange={(e) => handleAddressChange('cep', e.target.value)}
              onBlur={() => handleAddressBlur('cep')}
              error={touchedFields['address.cep'] ? formErrors['address.cep'] : undefined}
              fieldKey="cep"
            />

            <div className="sm:col-span-2">
              <ValidationInput
                label="Endereço"
                value={formData.address?.street || ''}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                onBlur={() => handleAddressBlur('street')}
                error={touchedFields['address.street'] ? formErrors['address.street'] : undefined}
              />
            </div>

            <ValidationInput
              label="Número"
              value={formData.address?.number || ''}
              onChange={(e) => handleAddressChange('number', e.target.value)}
              onBlur={() => handleAddressBlur('number')}
              error={touchedFields['address.number'] ? formErrors['address.number'] : undefined}
            />

            <ValidationInput
              label="Bairro"
              value={formData.address?.district || ''}
              onChange={(e) => handleAddressChange('district', e.target.value)}
              onBlur={() => handleAddressBlur('district')}
              error={touchedFields['address.district'] ? formErrors['address.district'] : undefined}
            />

            <ValidationInput
              label="Complemento"
              value={formData.address?.complement || ''}
              onChange={(e) => handleAddressChange('complement', e.target.value)}
              onBlur={() => handleAddressBlur('complement')}
              error={touchedFields['address.complement'] ? formErrors['address.complement'] : undefined}
            />

            <StateSelect
              label="Estado"
              value={formData.address?.state || ''}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              onBlur={() => handleAddressBlur('state')}
              error={touchedFields['address.state'] ? formErrors['address.state'] : undefined}
            />

            <ValidationInput
              label="Cidade"
              value={formData.address?.city || ''}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              onBlur={() => handleAddressBlur('city')}
              error={touchedFields['address.city'] ? formErrors['address.city'] : undefined}
            />

            <ValidationInput
              label="Caixa Postal"
              value={formData.address?.postalBox || ''}
              onChange={(e) => handleAddressChange('postalBox', e.target.value)}
              onBlur={() => handleAddressBlur('postalBox')}
              error={touchedFields['address.postalBox'] ? formErrors['address.postalBox'] : undefined}
            />
          </div>
        </Section>
      </form>
    </FormProvider>
  );
}