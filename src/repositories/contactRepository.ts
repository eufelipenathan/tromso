import { DatabaseService } from '@/services/database';
import { Contact } from '@/types';

class ContactRepository {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService('contacts');
  }

  async getAll(): Promise<Contact[]> {
    return this.db.getAll<Contact>({
      orderBy: [['name', 'asc']]
    });
  }

  async getById(id: string): Promise<Contact | null> {
    return this.db.getById<Contact>(id);
  }

  async getByCompany(companyId: string): Promise<Contact[]> {
    return this.db.getAll<Contact>({
      where: [['companyId', '==', companyId]],
      orderBy: [['name', 'asc']]
    });
  }

  async create(contact: Partial<Contact>): Promise<string> {
    return this.db.create<Contact>(contact);
  }

  async update(id: string, contact: Partial<Contact>): Promise<void> {
    await this.db.update<Contact>(id, contact);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(id);
  }

  async search(term: string): Promise<Contact[]> {
    return this.db.getAll<Contact>({
      where: [['searchTokens', 'array-contains', term.toLowerCase()]],
      orderBy: [['name', 'asc']]
    });
  }
}

export const contactRepository = new ContactRepository();