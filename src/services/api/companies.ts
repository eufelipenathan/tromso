import { companyRepository } from '@/repositories';
import { Company } from '@/types';

export const companyService = {
  async getAll() {
    return companyRepository.getAll();
  },

  async getById(id: string) {
    return companyRepository.getById(id);
  },

  async create(company: Partial<Company>) {
    return companyRepository.create(company);
  },

  async update(id: string, company: Partial<Company>) {
    await companyRepository.update(id, company);
  },

  async delete(id: string) {
    await companyRepository.delete(id);
  },

  async search(term: string) {
    return companyRepository.search(term);
  }
};