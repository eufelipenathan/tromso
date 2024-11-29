import React, { useState } from 'react';
import { z } from 'zod';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Company } from './types';

// Regex patterns
const PATTERNS = {
  phone: /^\(\d{2}\) \d{4,5}-\d{4}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  cep: /^\d{5}-\d{3}$/
} as const;

// Transform functions
const transform = {
  cnpj: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  },
  cep: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  },
  website: (value: string) => {
    if (!value) return '';
    let formatted = value.trim().toLowerCase();
    if (!formatted.match(/^https?:\/\//)) {
      formatted = formatted.startsWith('www.')
        ? `https://${formatted}`
        : `https://www.${formatted}`;
    } else if (!formatted.includes('www.')) {
      formatted = formatted.replace(/^(https?:\/\/)/, '$1www.');
    }
    return formatted;
  }
};

// Zod schemas with transforms
const ContactFieldSchema = z.object({
  id: z.string(),
  value: z.string(),
  createdAt: z.date()
});

const AddressSchema = z.object({
  cep: z.string()
    .transform(transform.cep)
    .pipe(z.string().regex(PATTERNS.cep, 'CEP inválido')),
  street: z.string().min(1, 'Endereço é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  district: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  complement: z.string().optional(),
  postalBox: z.string().optional()
});

const CompanySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  legalName: z.string().optional(),
  cnpj: z.string()
    .transform(transform.cnpj)
    .pipe(z.string().regex(PATTERNS.cnpj, 'CNPJ inválido'))
    .optional(),
  phones: z.array(ContactFieldSchema).refine(
    phones => phones.every(p => PATTERNS.phone.test(p.value)),
    'Um ou mais telefones são inválidos'
  ),
  emails: z.array(ContactFieldSchema).refine(
    emails => emails.every(e => PATTERNS.email.test(e.value)),
    'Um ou mais e-mails são inválidos'
  ),
  website: z.string()
    .transform(transform.website)
    .pipe(z.string().url('Website inválido'))
    .optional()
    .or(z.literal('')),
  address: AddressSchema,
  customFields: z.record(z.unknown()).optional()
});

const brazilianStates = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
] as const;

interface CompanyFormProps {
  company?: Company;
  onSubmit: (data: Partial<Company>) => Promise<void>;
}

export function CompanyForm({
  company,
  onSubmit
}: CompanyFormProps) {
  const [currentCompany, setCurrentCompany] = useState<Partial<Company>>(
    company || {
      phones: [],
      emails: [],
      address: {
        cep: '',
        street: '',
        number: '',
        district: '',
        city: '',
        state: '',
      },
      customFields: {}
    }
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [sectionsOpen, setSectionsOpen] = useState({
    basic: true,
    address: false
  });

  const validateForm = () => {
    try {
      const result = CompanySchema.parse(currentCompany);
      setFormErrors({});
      setCurrentCompany(result); // Apply transformed values
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(currentCompany);
  };

  const handleCEPChange = async (cep: string) => {
    const cleanedCEP = cep.replace(/\D/g, '');

    if (cleanedCEP.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setCurrentCompany(prev => ({
            ...prev,
            address: {
              ...prev.address!,
              cep,
              street: data.logradouro,
              district: data.bairro,
              city: data.localidade,
              state: data.uf,
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching CEP:', error);
      }
    }
  };

  const CollapsibleSection = ({ 
    id, 
    title, 
    children 
  }: { 
    id: keyof typeof sectionsOpen;
    title: string;
    children: React.ReactNode;
  }) => {
    const isOpen = sectionsOpen[id];
    const hasErrors = Object.keys(formErrors).some(key => key.startsWith(id));

    return (
      <div className="border rounded-lg overflow-hidden mb-4">
        <button
          type="button"
          className={`
            w-full px-4 py-3 flex items-center justify-between transition-colors
            ${hasErrors ? 'bg-red-50 hover:bg-red-100' : 'bg-gray-50 hover:bg-gray-100'}
          `}
          onClick={() => setSectionsOpen(prev => ({ ...prev, [id]: !prev[id] }))}
        >
          <span className={`
            text-sm font-medium
            ${hasErrors ? 'text-red-900' : 'text-gray-900'}
          `}>
            {title}
            {hasErrors && <span className="ml-2 text-red-600">(campos obrigatórios)</span>}
          </span>
          {isOpen ? (
            <ChevronUp className={`h-5 w-5 ${hasErrors ? 'text-red-500' : 'text-gray-500'}`} />
          ) : (
            <ChevronDown className={`h-5 w-5 ${hasErrors ? 'text-red-500' : 'text-gray-500'}`} />
          )}
        </button>
        {isOpen && (
          <div className="p-4 bg-white">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CollapsibleSection id="basic" title="Informações Básicas">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Nome
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={currentCompany.name || ''}
              onChange={(e) => setCurrentCompany(prev => ({ ...prev, name: e.target.value }))}
              className={`
                block w-full rounded-md border shadow-sm text-sm h-12 px-4
                ${formErrors.name 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }
              `}
            />
            {formErrors.name && (
              <p className="text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Razão Social
            </label>
            <input
              type="text"
              value={currentCompany.legalName || ''}
              onChange={(e) => setCurrentCompany(prev => ({ ...prev, legalName: e.target.value }))}
              className="block w-full rounded-md border border-gray-300 shadow-sm text-sm h-12 px-4 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              CNPJ
            </label>
            <input
              type="text"
              value={currentCompany.cnpj || ''}
              onChange={(e) => setCurrentCompany(prev => ({ ...prev, cnpj: e.target.value }))}
              maxLength={18}
              placeholder="00.000.000/0000-00"
              className={`
                block w-full rounded-md border shadow-sm text-sm h-12 px-4
                ${formErrors.cnpj 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }
              `}
            />
            {formErrors.cnpj && (
              <p className="text-sm text-red-600">{formErrors.cnpj}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              type="text"
              value={currentCompany.website || ''}
              onChange={(e) => setCurrentCompany(prev => ({ ...prev, website: e.target.value }))}
              placeholder="exemplo.com"
              className={`
                block w-full rounded-md border shadow-sm text-sm h-12 px-4
                ${formErrors.website 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }
              `}
            />
            {formErrors.website && (
              <p className="text-sm text-red-600">{formErrors.website}</p>
            )}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection id="address" title="Endereço">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">CEP</label>
            <input
              type="text"
              value={currentCompany.address?.cep || ''}
              onChange={(e) => {
                const value = e.target.value;
                setCurrentCompany(prev => ({
                  ...prev,
                  address: { ...prev.address!, cep: value }
                }));
                handleCEPChange(value);
              }}
              maxLength={9}
              placeholder="00000-000"
              className={`
                block w-full rounded-md border shadow-sm text-sm h-12 px-4
                ${formErrors['address.cep']
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }
              `}
            />
            {formErrors['address.cep'] && (
              <p className="text-sm text-red-600">{formErrors['address.cep']}</p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="block text-sm font-medium text-gray-700">Endereço</label>
            <input
              type="text"
              value={currentCompany.address?.street || ''}
              onChange={(e) => setCurrentCompany(prev => ({
                ...prev,
                address: { ...prev.address!, street: e.target.value }
              }))}
              className={`
                block w-full rounded-md border shadow-sm text-sm h-12 px-4
                ${formErrors['address.street']
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }
              `}
            />
            {formErrors['address.street'] && (
              <p className="text-sm text-red-600">{formErrors['address.street']}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Número</label>
            <input
              type="text"
              value={currentCompany.address?.number || ''}
              onChange={(e) => setCurrentCompany(prev => ({
                ...prev,
                address: { ...prev.address!, number: e.target.value }
              }))}
              className={`
                block w-full rounded-md border shadow-sm text-sm h-12 px-4
                ${formErrors['address.number']
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }
              `}
            />
            {formErrors['address.number'] && (
              <p className="text-sm text-red-600">{formErrors['address.number']}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Bairro</label>
            <input
              type="text"
              value={currentCompany.address?.district || ''}
              onChange={(e) => setCurrentCompany(prev => ({
                ...prev,
                address: { ...prev.address!, district: e.target.value }
              }))}
              className={`
                block w-full rounded-md border shadow-sm text-sm h-12 px-4
                ${formErrors['address.district']
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }
              `}
            />
            {formErrors['address.district'] && (
              <p className="text-sm text-red-600">{formErrors['address.district']}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Complemento</label>
            <input
              type="text"
              value={currentCompany.address?.complement || ''}
              onChange={(e) => setCurrentCompany(prev => ({
                ...prev,
                address: { ...prev.address!, complement: e.target.value }
              }))}
              className="block w-full rounded-md border border-gray-300 shadow-sm text-sm h-12 px-4 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              value={currentCompany.address?.state || ''}
              onChange={(e) => setCurrentCompany(prev => ({
                ...prev,
                address: { ...prev.address!, state: e.target.value }
              }))}
              className={`
                block w-full rounded-md border shadow-sm text-sm h-12 px-4
                ${formErrors['address.state']
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }
              `}
            >
              <option value="">Selecione o Estado</option>
              {brazilianStates.map(state => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
            {formErrors['address.state'] && (
              <p className="text-sm text-red-600">{formErrors['address.state']}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Cidade</label>
            <input
              type="text"
              value={currentCompany.address?.city || ''}
              onChange={(e) => setCurrentCompany(prev => ({
                ...prev,
                address: { ...prev.address!, city: e.target.value }
              }))}
              className={`
                block w-full rounded-md border shadow-sm text-sm h-12 px-4
                ${formErrors['address.city']
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }
              `}
            />
            {formErrors['address.city'] && (
              <p className="text-sm text-red-600">{formErrors['address.city']}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Caixa Postal</label>
            <input
              type="text"
              value={currentCompany.address?.postalBox || ''}
              onChange={(e) => setCurrentCompany(prev => ({
                ...prev,
                address: { ...prev.address!, postalBox: e.target.value }
              }))}
              className="block w-full rounded-md border border-gray-300 shadow-sm text-sm h-12 px-4 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </CollapsibleSection>
    </form>
  );
}