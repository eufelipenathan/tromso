import { z } from "zod";

const websiteRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
const cepRegex = /^\d{5}-\d{3}$/;

export const companySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string()
    .regex(cnpjRegex, "CNPJ inválido")
    .optional()
    .or(z.literal("")),
  email: z.string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .regex(phoneRegex, "Telefone inválido")
    .optional()
    .or(z.literal("")),
  website: z.string()
    .refine(value => !value || websiteRegex.test(value), "Website inválido")
    .transform(value => {
      if (!value) return null;
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        return `https://${value}`;
      }
      return value;
    })
    .optional()
    .or(z.literal("")),
  cep: z.string()
    .regex(cepRegex, "CEP inválido")
    .optional()
    .or(z.literal("")),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  mailbox: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string()
    .email("Email inválido")
    .optional()
    .nullable(),
  phone: z.string()
    .optional()
    .nullable(),
  position: z.string()
    .optional()
    .nullable(),
  companyId: z.string().min(1, "Empresa é obrigatória"),
});

export type CompanyFormData = z.infer<typeof companySchema>;
export type ContactFormData = z.infer<typeof contactSchema>;