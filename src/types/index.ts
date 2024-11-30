export interface ContactField {
  id: string;
  value: string;
}

export interface Company {
  id: string;
  name: string;
  legalName: string;
  cnpj: string;
  phones: ContactField[];
  emails: ContactField[];
  createdAt: Date;
}
