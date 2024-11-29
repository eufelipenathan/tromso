import { DatabaseService } from '@/services/database';
import { Company } from '@/types';

class CompanyRepository {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService('companies');
  }

  async getAll(): Promise<Company[]> {
    return this.db.getAll<Company>({
      orderBy: [['name', 'asc']]
    });
  }

  async getById(id: string): Promise<Company | null> {
    return this.db.getById<Company>(id);
  }

  async create(company: Partial<Company>): Promise<string> {
    return this.db.create<Company>(company);
  }

  async update(id: string, company: Partial<Company>): Promise<void> {
    await this.db.update<Company>(id, company);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(id);
  }

  async search(term: string): Promise<Company[]> {
    return this.db.getAll<Company>({
      where: [['searchTokens', 'array-contains', term.toLowerCase()]],
      orderBy: [['name', 'asc']]
    });
  }
}

export const companyRepository = new CompanyRepository();