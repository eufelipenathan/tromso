import React from 'react';
import { maskCEP } from '@/utils/masks';
import { Address } from '@/types';
import ValidationInput from './ValidationInput';
import { useFormStyles } from './styles/useFormStyles';

interface AddressFormProps {
  value: Address;
  onChange: (address: Address) => void;
  errors?: Record<string, string>;
}

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

const AddressForm: React.FC<AddressFormProps> = ({ value, onChange, errors = {} }) => {
  const styles = useFormStyles();

  const handleCEPChange = async (cep: string) => {
    const cleanedCEP = cep.replace(/\D/g, '');
    if (cleanedCEP.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
        const data = await response.json();
        if (!data.erro) {
          onChange({
            ...value,
            street: data.logradouro,
            district: data.bairro,
            city: data.localidade,
            state: data.uf,
          });
        }
      } catch (error) {
        console.error('Error fetching CEP:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <ValidationInput
            label="CEP"
            value={value.cep}
            onChange={(e) => {
              const maskedCEP = maskCEP(e.target.value);
              onChange({ ...value, cep: maskedCEP });
            }}
            onBlur={() => handleCEPChange(value.cep)}
            fieldKey="cep"
            maxLength={9}
            placeholder="00000-000"
            error={errors['address.cep']}
          />
        </div>

        <div className="sm:col-span-2">
          <ValidationInput
            label="Endereço"
            value={value.street}
            onChange={(e) => onChange({ ...value, street: e.target.value })}
            error={errors['address.street']}
          />
        </div>

        <div>
          <ValidationInput
            label="Número"
            value={value.number}
            onChange={(e) => onChange({ ...value, number: e.target.value })}
            error={errors['address.number']}
          />
        </div>

        <div>
          <ValidationInput
            label="Bairro"
            value={value.district}
            onChange={(e) => onChange({ ...value, district: e.target.value })}
            error={errors['address.district']}
          />
        </div>

        <div>
          <ValidationInput
            label="Complemento"
            value={value.complement || ''}
            onChange={(e) => onChange({ ...value, complement: e.target.value })}
          />
        </div>

        <div>
          <label className={styles.label}>Estado</label>
          <select
            value={value.state}
            onChange={(e) => onChange({ ...value, state: e.target.value })}
            className={styles.input}
          >
            <option value="">Selecione o Estado</option>
            {brazilianStates.map(state => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
          {errors['address.state'] && (
            <p className={styles.errorMessage}>{errors['address.state']}</p>
          )}
        </div>

        <div>
          <ValidationInput
            label="Cidade"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            error={errors['address.city']}
          />
        </div>

        <div>
          <ValidationInput
            label="Caixa Postal"
            value={value.postalBox || ''}
            onChange={(e) => onChange({ ...value, postalBox: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default AddressForm;