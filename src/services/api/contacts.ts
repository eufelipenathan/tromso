import { contactRepository } from '@/repositories';
import { Contact } from '@/types';

export const contactService = {
  async getAll() {
    return contactRepository.getAll();
  },

  async getById(id: string) {
    return contactRepository.getById(id);
  },

  async getByCompany(companyId: string) {
    return contactRepository.getByCompany(companyId);
  },

  async create(contact: Partial<Contact>) {
    return contactRepository.create(contact);
  },

  async update(id: string, contact: Partial<Contact>) {
    await contactRepository.update(id, contact);
  },

  async delete(id: string) {
    await contactRepository.delete(id);
  },

  async search(term: string) {
    return contactRepository.search(term);
  }
};