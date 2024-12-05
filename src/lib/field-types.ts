export const fieldTypes = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Telefone" },
  { value: "date", label: "Data" },
  { value: "select", label: "Seleção" },
  { value: "textarea", label: "Área de Texto" },
] as const;

export function getFieldTypeLabel(type: string): string {
  return fieldTypes.find(t => t.value === type)?.label || type;
}