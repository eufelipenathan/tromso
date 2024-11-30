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
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json() as ViaCepResponse;
    
    if (data.erro) {
      return null;
    }

    return {
      cep: data.cep.replace(/\D/g, ''),
      street: data.logradouro,
      complement: data.complemento,
      district: data.bairro,
      city: data.localidade,
      state: data.uf
    };
  } catch (error) {
    console.error('Error fetching CEP:', error);
    return null;
  }
}