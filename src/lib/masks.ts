"use client";

export function cnpjMask(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  return cleaned
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18); // Limita ao tamanho máximo do CNPJ com máscara
}

export function phoneMask(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  const hasNinthDigit = cleaned.length > 10;

  if (hasNinthDigit) {
    return cleaned
      .replace(/^(\d{2})/, "($1) ")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15); // (99) 99999-9999
  }

  return cleaned
    .replace(/^(\d{2})/, "($1) ")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 14); // (99) 9999-9999
}

export function cepMask(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  return cleaned.replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9); // 99999-999
}
