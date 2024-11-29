import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CustomField, CustomSection } from '@/types';

export function useCustomFields(entity: 'company' | 'contact') {
  const [sections, setSections] = useState<CustomSection[]>([]);
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sections
        const sectionsQuery = query(
          collection(db, 'customSections'),
          where('entity', '==', entity)
        );
        const sectionsSnapshot = await getDocs(sectionsQuery);
        const sectionsData = sectionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CustomSection[];
        setSections(sectionsData.sort((a, b) => a.order - b.order));

        // Fetch fields
        const fieldsQuery = query(
          collection(db, 'customFields'),
          where('entity', '==', entity)
        );
        const fieldsSnapshot = await getDocs(fieldsQuery);
        const fieldsData = fieldsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CustomField[];
        setFields(fieldsData);
      } catch (error) {
        console.error('Error fetching custom fields:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [entity]);

  return { sections, fields, loading };
}

export function validateCustomFields(
  fields: CustomField[],
  values: Record<string, any>
): Record<string, string> {
  const errors: Record<string, string> = {};

  fields.forEach(field => {
    const value = values[field.id];

    if (field.required) {
      if (value === undefined || value === '' || 
         (Array.isArray(value) && value.length === 0)) {
        errors[field.id] = 'Campo obrigatório';
      }
    }

    // Validações específicas por tipo
    if (value !== undefined && value !== '') {
      switch (field.type) {
        case 'number':
          if (isNaN(Number(value))) {
            errors[field.id] = 'Valor inválido';
          }
          break;
        case 'date':
          if (isNaN(Date.parse(value))) {
            errors[field.id] = 'Data inválida';
          }
          break;
        case 'select':
          if (field.multipleSelect) {
            if (!Array.isArray(value) || 
                value.some(v => !field.options?.includes(v))) {
              errors[field.id] = 'Opção inválida';
            }
          } else if (!field.options?.includes(value)) {
            errors[field.id] = 'Opção inválida';
          }
          break;
      }
    }
  });

  return errors;
}