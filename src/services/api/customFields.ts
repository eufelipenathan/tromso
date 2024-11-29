import { customFieldRepository } from '@/repositories';
import { CustomField, CustomSection } from '@/types';

export const customFieldService = {
  async getAllFields(entity: 'company' | 'contact') {
    return customFieldRepository.getAllFields(entity);
  },

  async getAllSections(entity: 'company' | 'contact') {
    return customFieldRepository.getAllSections(entity);
  },

  async createField(field: Partial<CustomField>) {
    return customFieldRepository.createField(field);
  },

  async createSection(section: Partial<CustomSection>) {
    return customFieldRepository.createSection(section);
  },

  async updateField(id: string, field: Partial<CustomField>) {
    await customFieldRepository.updateField(id, field);
  },

  async updateSection(id: string, section: Partial<CustomSection>) {
    await customFieldRepository.updateSection(id, section);
  },

  async deleteField(id: string) {
    await customFieldRepository.deleteField(id);
  },

  async deleteSection(id: string) {
    await customFieldRepository.deleteSection(id);
  },

  async updateFieldsOrder(fields: { id: string; order: number }[]) {
    await customFieldRepository.updateFieldsOrder(fields);
  },

  async updateSectionsOrder(sections: { id: string; order: number }[]) {
    await customFieldRepository.updateSectionsOrder(sections);
  }
};