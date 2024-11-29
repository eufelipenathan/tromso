import React, { useState, useEffect } from 'react';
import { Deal } from '@/types/pipeline';
import { Company, Contact } from '@/types';
import { useCustomFields } from '@/hooks/useCustomFields';
import { ChevronRight } from 'lucide-react';
import { dealConfig } from '@/lib/entity-management/configs/dealConfig';
import { companyConfig } from '@/lib/entity-management/configs/companyConfig';
import { contactConfig } from '@/lib/entity-management/configs/contactConfig';
import { useInlineEditing } from '@/hooks/useInlineEditing';
import EditableField from './EditableField';

interface DealSidebarProps {
  deal: Deal;
  company: Company | null;
  contact: Contact | null;
}

const DealSidebar: React.FC<DealSidebarProps> = ({ deal, company, contact }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'deal': true,
    'company': true,
    'contact': true
  });

  const { fields: customDealFields } = useCustomFields('deal');
  const { fields: customCompanyFields } = useCustomFields('company');
  const { fields: customContactFields } = useCustomFields('contact');

  const dealEditing = useInlineEditing<Deal>('deals', deal);
  const companyEditing = useInlineEditing<Company>('companies', company);
  const contactEditing = useInlineEditing<Contact>('contacts', contact);

  // Update local state when props change
  useEffect(() => {
    dealEditing.setEntity(deal);
  }, [deal]);

  useEffect(() => {
    companyEditing.setEntity(company);
  }, [company]);

  useEffect(() => {
    contactEditing.setEntity(contact);
  }, [contact]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const Section = ({ id, title, children }: { 
    id: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <div>
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-3 py-2 bg-gray-50 border-b flex items-center space-x-2 group hover:bg-gray-100 transition-colors"
      >
        <ChevronRight className={`
          h-3.5 w-3.5 text-gray-400 transition-transform duration-200 flex-shrink-0
          ${openSections[id] ? 'transform rotate-90' : ''}
        `} />
        <h3 className="text-xs font-medium text-gray-700">{title}</h3>
      </button>
      <div className={`
        overflow-hidden transition-all duration-200
        ${openSections[id] ? 'max-h-96' : 'max-h-0'}
      `}>
        <div className="p-3 space-y-3">
          {children}
        </div>
      </div>
    </div>
  );

  const getEditingHook = (entityType: 'deal' | 'company' | 'contact') => {
    switch (entityType) {
      case 'deal':
        return dealEditing;
      case 'company':
        return companyEditing;
      case 'contact':
        return contactEditing;
    }
  };

  const renderFields = (
    entityType: 'deal' | 'company' | 'contact',
    baseFields: typeof dealConfig.baseFields,
    customFields: typeof customDealFields
  ) => {
    const { entity, saveField } = getEditingHook(entityType);
    if (!entity?.id) return null;

    const fields = [
      ...baseFields,
      ...customFields
        .filter(field => field.section === 'Informações Básicas')
        .map(field => ({
          ...field,
          key: `customFields.${field.id}`,
          customField: true
        }))
    ];

    return fields.map(field => {
      let value = field.customField 
        ? entity.customFields?.[field.key.split('.')[1]]
        : entity[field.key];

      if (field.type === 'array' && Array.isArray(value)) {
        return value.map((item, index) => {
          const formatted = field.format!(item, index);
          return (
            <EditableField
              key={`${field.key}-${index}`}
              label={formatted.label}
              value={formatted.value}
              onSave={async (newValue) => {
                try {
                  const newArray = [...value];
                  newArray[index] = newValue;
                  return await saveField(field.key, newArray, value);
                } catch (error) {
                  throw error;
                }
              }}
              validate={field.validate}
              mask={field.mask}
              required={field.required}
              type={field.type}
              fieldKey={field.key}
            />
          );
        });
      }

      if (field.format) {
        value = field.format(value);
      }

      return (
        <EditableField
          key={field.key}
          label={field.label}
          value={value?.toString() || ''}
          onSave={async (newValue) => {
            try {
              return await saveField(field.key, newValue, value);
            } catch (error) {
              throw error;
            }
          }}
          validate={field.validate}
          mask={field.mask}
          required={field.required}
          type={field.type}
          fieldKey={field.key}
        />
      );
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto border-t border-b">
      <Section id="deal" title="Informações do Negócio">
        <div className="space-y-3">
          {renderFields('deal', dealConfig.baseFields, customDealFields)}
        </div>
      </Section>

      {company && (
        <Section id="company" title="Dados da Empresa">
          <div className="space-y-3">
            {renderFields('company', companyConfig.baseFields, customCompanyFields)}
          </div>
        </Section>
      )}

      {contact && (
        <Section id="contact" title="Dados do Contato">
          <div className="space-y-3">
            {renderFields('contact', contactConfig.baseFields, customContactFields)}
          </div>
        </Section>
      )}
    </div>
  );
};

export default DealSidebar;