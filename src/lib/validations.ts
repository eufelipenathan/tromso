import { z } from "zod";

const websiteRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
const cepRegex = /^\d{5}-\d{3}$/;

export const companySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string()
    .regex(cnpjRegex, "CNPJ inválido")
    .nullable()
    .optional()
    .transform(v => v || null),
  email: z.string()
    .email("Email inválido")
    .nullable()
    .optional()
    .transform(v => v || null),
  phone: z.string()
    .regex(phoneRegex, "Telefone inválido")
    .nullable()
    .optional()
    .transform(v => v || null),
  website: z.string()
    .refine(value => !value || websiteRegex.test(value), "Website inválido")
    .transform(value => {
      if (!value) return null;
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        return `https://${value}`;
      }
      return value;
    })
    .nullable()
    .optional(),
  cep: z.string()
    .regex(cepRegex, "CEP inválido")
    .nullable()
    .optional()
    .transform(v => v || null),
  street: z.string().nullable().optional().transform(v => v || null),
  number: z.string().nullable().optional().transform(v => v || null),
  complement: z.string().nullable().optional().transform(v => v || null),
  neighborhood: z.string().nullable().optional().transform(v => v || null),
  city: z.string().nullable().optional().transform(v => v || null),
  state: z.string().nullable().optional().transform(v => v || null),
  mailbox: z.string().nullable().optional().transform(v => v || null),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string()
    .email("Email inválido")
    .nullable()
    .optional()
    .transform(v => v || null),
  phone: z.string()
    .regex(phoneRegex, "Telefone inválido")
    .nullable()
    .optional()
    .transform(v => v || null),
  position: z.string()
    .nullable()
    .optional()
    .transform(v => v || null),
  companyId: z.string().min(1, "Empresa é obrigatória"),
});

export const dealSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  value: z.number().min(0, "Valor deve ser maior ou igual a zero"),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  contactId: z.string().min(1, "Contato é obrigatório"),
  stageId: z.string().min(1, "Estágio é obrigatório"),
  lostReasonId: z.string().nullable().optional(),
  closedAt: z.date().nullable().optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type DealFormData = z.infer<typeof dealSchema>;