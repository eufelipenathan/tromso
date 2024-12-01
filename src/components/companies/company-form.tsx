"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSection } from "@/components/ui/form-section";
import { companySchema, type CompanyFormData } from "@/lib/validations";
import { cnpjMask, phoneMask, cepMask } from "@/lib/masks";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { STATES } from "@/lib/constants";

interface CompanyFormProps {
  onSubmit: (data: CompanyFormData) => Promise<void>;
  initialData?: Partial<CompanyFormData>;
}

export function CompanyForm({ onSubmit, initialData }: CompanyFormProps) {
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: initialData,
    mode: "onBlur",
  });

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const masked = cnpjMask(value);
    setValue("cnpj", masked, { shouldValidate: false });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const masked = phoneMask(value);
    setValue("phone", masked, { shouldValidate: false });
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const masked = cepMask(value);
    setValue("cep", masked, { shouldValidate: false });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setValue("number", value);
  };

  const handleCEPBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length === 8) {
      setIsSearchingCep(true);
      try {
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
        setIsSearchingCep(false);
      }
    }
    trigger("cep");
  };

  return (
    <form id="company-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title="Informações básicas" defaultOpen>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="required">Nome</Label>
            <Input 
              id="name" 
              {...register("name")}
              className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input 
              id="cnpj" 
              value={watch("cnpj") || ""}
              onChange={handleCNPJChange}
              onBlur={() => trigger("cnpj")}
              placeholder="00.000.000/0000-00"
              className={cn(errors.cnpj && "border-destructive focus-visible:ring-destructive")}
            />
            {errors.cnpj && (
              <p className="text-sm text-destructive">{errors.cnpj.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              {...register("email")}
              onBlur={() => trigger("email")}
              placeholder="exemplo@email.com"
              className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input 
              id="phone" 
              value={watch("phone") || ""}
              onChange={handlePhoneChange}
              onBlur={() => trigger("phone")}
              placeholder="(00) 00000-0000"
              className={cn(errors.phone && "border-destructive focus-visible:ring-destructive")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="website">Site</Label>
            <Input 
              id="website" 
              {...register("website")}
              onBlur={() => trigger("website")}
              placeholder="www.exemplo.com.br"
              className={cn(errors.website && "border-destructive focus-visible:ring-destructive")}
            />
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
              value={watch("cep") || ""}
              onChange={handleCEPChange}
              onBlur={handleCEPBlur}
              placeholder="00000-000"
              className={cn(errors.cep && "border-destructive focus-visible:ring-destructive")}
              disabled={isSearchingCep}
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input 
              id="number" 
              value={watch("number") || ""}
              onChange={handleNumberChange}
              inputMode="numeric"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input id="complement" {...register("complement")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input 
              id="neighborhood" 
              {...register("neighborhood")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input 
              id="city" 
              {...register("city")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <select
              id="state"
              {...register("state")}
              className="block w-full h-[38px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Selecione</option>
              {STATES.map((state) => (
                <option key={state.uf} value={state.uf}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mailbox">Caixa Postal</Label>
            <Input id="mailbox" {...register("mailbox")} />
          </div>
        </div>
      </FormSection>
    </form>
  );
}