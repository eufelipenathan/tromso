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