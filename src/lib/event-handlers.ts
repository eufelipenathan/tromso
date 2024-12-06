import { toast } from "@/hooks/use-toast";

export async function handleFormSubmitWithPropagation<T>(
  e: React.FormEvent,
  formId: string,
  onSubmit: (data: T) => Promise<void>,
  onSuccess?: () => void,
  onError?: (error: unknown) => void
) {
  // CRITICAL: Sempre prevenir comportamento padrão e propagação
  e.preventDefault();
  e.stopPropagation();

  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Limpar strings vazias para null
  const cleanData = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value === "" ? null : value
    ])
  );

  try {
    await onSubmit(cleanData as T);
    onSuccess?.();
  } catch (error) {
    onError?.(error);
    toast({
      variant: "destructive",
      title: "Erro",
      description: "Ocorreu um erro ao processar o formulário"
    });
  }
}