export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  postalBox?: string;
  state: string;
  city: string;
}

export interface ContactField {
  id: string;
  value: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Contact {
  id?: string;
  name: string;
  companyId: string;
  phones: ContactField[];
  emails: ContactField[];
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  isDeleted?: boolean;
  customFields?: Record<string, any>;
}

export interface Company {
  id?: string;
  name: string;
  legalName: string;
  cnpj: string;
  phones: ContactField[];
  emails: ContactField[];
  website?: string;
  address: Address;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  isDeleted?: boolean;
  customFields?: Record<string, any>;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  required?: boolean;
  options?: string[];
  multipleSelect?: boolean;
  entity: 'company' | 'contact';
  sectionId: string;
  order: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CustomSection {
  id: string;
  name: string;
  entity: 'company' | 'contact';
  order: number;
  createdAt: Date;
  updatedAt?: Date;
}