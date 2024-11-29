import { Company } from '@/types';

export interface CompanyState {
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
  addCompany: (company: Company) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;
  removeCompany: (id: string) => void;
  getCompany: (id: string) => Company | undefined;
}