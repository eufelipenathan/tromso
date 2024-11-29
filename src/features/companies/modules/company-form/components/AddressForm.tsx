import React from 'react';
import { Address } from '../types';

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
];

interface AddressFormProps {
  value: Address;
  onChange: (address: Address) => void;
  onCEPChange: (cep: string) => void;
  errors?: Record<string, string>;
}

export const AddressForm: React.FC<AddressFormProps> = ({ 
  value, 
  onChange,
  onCEPChange,
  errors = {} 
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">CEP</label>
          <input
            type="text"
            value={value.cep}
            onChange={(e) => {
              onChange({ ...value, cep: e.target.value });
              onCEPChange(e.target.value);
            }}
            maxLength={9}
            placeholder="00000-000"
            className={`
              block w-full rounded-md border shadow-sm text-sm h-12 px-4
              ${errors['address.cep']
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }
            `}
          />
          {errors['address.cep'] && (
            <p className="text-sm text-red-600">{errors['address.cep']}</p>
          )}
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="block text-sm font-medium text-gray-700">Endereço</label>
          <input
            type="text"
            value={value.street}
            onChange={(e) => onChange({ ...value, street: e.target.value })}
            className={`
              block w-full rounded-md border shadow-sm text-sm h-12 px-4
              ${errors['address.street']
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }
            `}
          />
          {errors['address.street'] && (
            <p className="text-sm text-red-600">{errors['address.street']}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Número</label>
          <input
            type="text"
            value={value.number}
            onChange={(e) => onChange({ ...value, number: e.target.value })}
            className={`
              block w-full rounded-md border shadow-sm text-sm h-12 px-4
              ${errors['address.number']
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }
            `}
          />
          {errors['address.number'] && (
            <p className="text-sm text-red-600">{errors['address.number']}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Bairro</label>
          <input
            type="text"
            value={value.district}
            onChange={(e) => onChange({ ...value, district: e.target.value })}
            className={`
              block w-full rounded-md border shadow-sm text-sm h-12 px-4
              ${errors['address.district']
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }
            `}
          />
          {errors['address.district'] && (
            <p className="text-sm text-red-600">{errors['address.district']}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Complemento</label>
          <input
            type="text"
            value={value.complement || ''}
            onChange={(e) => onChange({ ...value, complement: e.target.value })}
            className="block w-full rounded-md border border-gray-300 shadow-sm text-sm h-12 px-4 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <select
            value={value.state}
            onChange={(e) => onChange({ ...value, state: e.target.value })}
            className={`
              block w-full rounded-md border shadow-sm text-sm h-12 px-4
              ${errors['address.state']
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
          {errors['address.state'] && (
            <p className="text-sm text-red-600">{errors['address.state']}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Cidade</label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            className={`
              block w-full rounded-md border shadow-sm text-sm h-12 px-4
              ${errors['address.city']
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }
            `}
          />
          {errors['address.city'] && (
            <p className="text-sm text-red-600">{errors['address.city']}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Caixa Postal</label>
          <input
            type="text"
            value={value.postalBox || ''}
            onChange={(e) => onChange({ ...value, postalBox: e.target.value })}
            className="block w-full rounded-md border border-gray-300 shadow-sm text-sm h-12 px-4 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};