export const validateCNPJ = (cnpj: string) => {
  cnpj = cnpj.replace(/[^\d]/g, '');

  if (cnpj.length !== 14) return false;

  // Elimina CNPJs invalidos conhecidos
  if (/^(\d)\1+$/.test(cnpj)) return false;

  // Valida DVs
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== Number(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== Number(digitos.charAt(1))) return false;

  return true;
};

export const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
};

export const validateCEP = (cep: string) => {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
};

export const validateWebsite = (url: string): boolean => {
  if (!url) return true;
  // Aceita URLs com ou sem protocolo e www
  const pattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}$/;
  return pattern.test(url);
};

export const formatWebsite = (url: string): string => {
  if (!url) return '';
  
  let formattedUrl = url.trim().toLowerCase();
  
  // Se não começar com http:// ou https://, adiciona https://
  if (!formattedUrl.match(/^https?:\/\//)) {
    // Se começar com www., adiciona https://
    if (formattedUrl.startsWith('www.')) {
      formattedUrl = 'https://' + formattedUrl;
    } else {
      // Se não começar com www., adiciona https://www.
      formattedUrl = 'https://www.' + formattedUrl;
    }
  } else if (!formattedUrl.includes('www.')) {
    // Se tiver http(s):// mas não tiver www., insere www. após o protocolo
    formattedUrl = formattedUrl.replace(/^(https?:\/\/)/, '$1www.');
  }
  
  return formattedUrl;
};