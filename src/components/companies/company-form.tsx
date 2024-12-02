"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSection } from "@/components/ui/form-section";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const brazilianStates = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" }
];

const companySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  mailbox: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyFormProps {
  onSubmit: (data: CompanyFormData) => Promise<void>;
}

export function CompanyForm({ onSubmit }: CompanyFormProps) {
  const [addressLoading, setAddressLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  const searchCep = async (cep: string) => {
    if (!cep || cep.length !== 8) return;

    try {
      setAddressLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setValue("street", data.logradouro);
        setValue("neighborhood", data.bairro);
        setValue("city", data.localidade);
        setValue("state", data.uf);
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setAddressLoading(false);
    }
  };

  return (
    <form id="company-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title="Informações básicas" defaultOpen>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="required">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" {...register("cnpj")} />
            {errors.cnpj && (
              <p className="text-sm text-destructive">{errors.cnpj.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" {...register("phone")} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register("website")} />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            )}
          </div>
        </div>
      </FormSection>

      <FormSection title="Endereço">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              {...register("cep")}
              onBlur={(e) => searchCep(e.target.value.replace(/\D/g, ""))}
              disabled={addressLoading}
            />
            {errors.cep && (
              <p className="text-sm text-destructive">{errors.cep.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Endereço</Label>
            <Input
              id="street"
              {...register("street")}
              disabled={addressLoading}
            />
            {errors.street && (
              <p className="text-sm text-destructive">{errors.street.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input id="number" {...register("number")} />
            {errors.number && (
              <p className="text-sm text-destructive">{errors.number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input id="complement" {...register("complement")} />
            {errors.complement && (
              <p className="text-sm text-destructive">{errors.complement.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              {...register("neighborhood")}
              disabled={addressLoading}
            />
            {errors.neighborhood && (
              <p className="text-sm text-destructive">{errors.neighborhood.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              {...register("city")}
              disabled={addressLoading}
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
  <Label htmlFor="state">Estado</Label>
  <select
    id="state"
    {...register("state")}
    className="block w-full h-[38px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    disabled={addressLoading}
  >
    <option value="">Selecione</option>
    {brazilianStates.map((state) => (
      <option key={state.value} value={state.value}>
        {state.label}
      </option>
    ))}
  </select>
  {errors.state && (
    <p className="text-sm text-destructive">{errors.state.message}</p>
  )}
</div>

          <div className="space-y-2">
            <Label htmlFor="mailbox">Caixa Postal</Label>
            <Input id="mailbox" {...register("mailbox")} />
            {errors.mailbox && (
              <p className="text-sm text-destructive">{errors.mailbox.message}</p>
            )}
          </div>
        </div>
      </FormSection>
    </form>
  );
}