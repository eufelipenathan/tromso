import React from 'react';
import { CustomField, CustomSection } from '@/types';
import ValidationInput from './ValidationInput';
import Section from './Section';

interface CustomFieldsSectionProps {
  sections: CustomSection[];
  fields: CustomField[];
  values: Record<string, string | number | boolean | Date | string[]>;
  onChange: (values: Record<string, any>) => void;
  errors?: Record<string, string>;
}

const CustomFieldsSection: React.FC<CustomFieldsSectionProps> = ({
  sections,
  fields,
  values,
  onChange,
  errors = {}
}) => {
  const handleFieldChange = (fieldId: string, value: string | number | boolean | Date | string[]) => {
    onChange({
      ...values,
      [fieldId]: value
    });
  };

  const renderField = (field: CustomField) => {
    switch (field.type) {
      case 'text':
        return (
          <ValidationInput
            key={field.id}
            label={field.name}
            value={values[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            error={errors[field.id]}
            required={field.required}
          />
        );
      
      case 'number':
        return (
          <ValidationInput
            key={field.id}
            type="number"
            label={field.name}
            value={values[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            error={errors[field.id]}
            required={field.required}
          />
        );
      
      case 'date':
        return (
          <ValidationInput
            key={field.id}
            type="date"
            label={field.name}
            value={values[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            error={errors[field.id]}
            required={field.required}
          />
        );
      
      case 'select':
        if (field.multipleSelect) {
          return (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="space-y-2">
                {field.options?.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(values[field.id] || []).includes(option)}
                      onChange={(e) => {
                        const currentValues = values[field.id] || [];
                        const newValues = e.target.checked
                          ? [...currentValues, option]
                          : currentValues.filter((v: string) => v !== option);
                        handleFieldChange(field.id, newValues);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
              {errors[field.id] && (
                <p className="text-sm text-red-600">{errors[field.id]}</p>
              )}
            </div>
          );
        }

        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={values[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
              required={field.required}
            >
              <option value="">Selecione uma opção</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors[field.id] && (
              <p className="text-sm text-red-600">{errors[field.id]}</p>
            )}
          </div>
        );
    }
  };

  return (
    <>
      {sections.map((section) => {
        const sectionFields = fields.filter(field => field.sectionId === section.id);
        if (sectionFields.length === 0) return null;

        return (
          <Section key={section.id} title={section.name}>
            <div className="grid grid-cols-1 gap-4">
              {sectionFields.map(field => renderField(field))}
            </div>
          </Section>
        );
      })}
    </>
  );
};

export default CustomFieldsSection;