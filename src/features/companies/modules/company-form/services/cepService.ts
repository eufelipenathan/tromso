import { Address } from '@/types';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function searchCep(cep: string): Promise<Partial<Address> | null> {
  console.log('[cepService] Searching CEP:', cep);
  
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) {
    console.log('[cepService] Invalid CEP length');
    return null;
  }

  try {
    console.log('[cepService] Fetching address from ViaCEP');
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json() as ViaCepResponse;
    
    console.log('[cepService] ViaCEP response:', data);

    if (data.erro) {
      console.log('[cepService] CEP not found');
      return null;
    }

    const address: Partial<Address> = {
      cep: data.cep.replace(/\D/g, ''),
      street: data.logradouro,
      complement: data.complemento,
      district: data.bairro,
      city: data.localidade,
      state: data.uf
    };

    console.log('[cepService] Normalized address:', address);
    return address;
  } catch (error) {
    console.error('[cepService] Error fetching CEP:', error);
    return null;
  }
}