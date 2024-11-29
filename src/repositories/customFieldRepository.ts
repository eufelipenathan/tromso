import { DatabaseService } from '@/services/database';
import { CustomField, CustomSection } from '@/types';

class CustomFieldRepository {
  private fieldsDb: DatabaseService;
  private sectionsDb: DatabaseService;

  constructor() {
    this.fieldsDb = new DatabaseService('customFields');
    this.sectionsDb = new DatabaseService('customSections');
  }

  async getAllFields(entity: 'company' | 'contact'): Promise<CustomField[]> {
    return this.fieldsDb.getAll<CustomField>({
      where: [['entity', '==', entity]],
      orderBy: [['order', 'asc']]
    });
  }

  async getAllSections(entity: 'company' | 'contact'): Promise<CustomSection[]> {
    return this.sectionsDb.getAll<CustomSection>({
      where: [['entity', '==', entity]],
      orderBy: [['order', 'asc']]
    });
  }

  async createField(field: Partial<CustomField>): Promise<string> {
    return this.fieldsDb.create<CustomField>(field);
  }

  async createSection(section: Partial<CustomSection>): Promise<string> {
    return this.sectionsDb.create<CustomSection>(section);
  }

  async updateField(id: string, field: Partial<CustomField>): Promise<void> {
    await this.fieldsDb.update<CustomField>(id, field);
  }

  async updateSection(id: string, section: Partial<CustomSection>): Promise<void> {
    await this.sectionsDb.update<CustomSection>(id, section);
  }

  async deleteField(id: string): Promise<void> {
    await this.fieldsDb.delete(id);
  }

  async deleteSection(id: string): Promise<void> {
    await this.sectionsDb.delete(id);
  }

  async updateFieldsOrder(fields: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of fields) {
      await this.fieldsDb.update<CustomField>(id, { order });
    }
  }

  async updateSectionsOrder(sections: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of sections) {
      await this.sectionsDb.update<CustomSection>(id, { order });
    }
  }
}

export const customFieldRepository = new CustomFieldRepository();