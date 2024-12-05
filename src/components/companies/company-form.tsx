"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Label, FormSection } from "@/components/ui";
import { cn } from "@/lib/utils";
import { companySchema, type CompanyFormData } from "@/lib/validations";
import { cnpjMask, phoneMask, cepMask } from "@/lib/masks";
import { STATES } from "@/lib/constants";
import { CustomFields } from "@/components/form/custom-fields";
import { CompanyContactsSection } from "./company-contacts-section";
import { useCompanyStore } from "@/stores/use-company-store";
import { useEffect } from "react";

interface CompanyFormProps {
  onSubmit: (data: CompanyFormData) => Promise<void>;
  initialData?: Partial<CompanyFormData>;
}

export function CompanyForm({ onSubmit, initialData }: CompanyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: initialData,
  });

  const { formData, setFormData } = useCompanyStore();

  useEffect(() => {
    if (formData) {
      Object.entries(formData).forEach(([key, value]) => {
        setValue(key as keyof CompanyFormData, value);
      });
    }
  }, [formData, setValue]);

  const handleFormSubmit = async (data: CompanyFormData) => {
    setFormData(data);
    await onSubmit(data);
  };

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

  const handleCEPBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length === 8) {
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
      }
    }
    trigger("cep");
  };

  const handleFieldChange = (name: keyof CompanyFormData, value: any) => {
    setValue(name, value);
    setFormData({ ...formData, [name]: value });
  };

  return (
    <form
      id="company-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      <FormSection title="Informações básicas" defaultOpen>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="required">
              Nome
            </Label>
            <Input
              id="name"
              {...register("name")}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className={cn(
                errors.name &&
                  "border-destructive focus-visible:ring-destructive"
              )}
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
              onChange={(e) => {
                handleCNPJChange(e);
                handleFieldChange("cnpj", e.target.value);
              }}
              onBlur={() => trigger("cnpj")}
              placeholder="00.000.000/0000-00"
              className={cn(
                errors.cnpj &&
                  "border-destructive focus-visible:ring-destructive"
              )}
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
              onChange={(e) => handleFieldChange("email", e.target.value)}
              onBlur={() => trigger("email")}
              placeholder="exemplo@email.com"
              className={cn(
                errors.email &&
                  "border-destructive focus-visible:ring-destructive"
              )}
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
              onChange={(e) => {
                handlePhoneChange(e);
                handleFieldChange("phone", e.target.value);
              }}
              onBlur={() => trigger("phone")}
              placeholder="(00) 00000-0000"
              className={cn(
                errors.phone &&
                  "border-destructive focus-visible:ring-destructive"
              )}
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
              onChange={(e) => handleFieldChange("website", e.target.value)}
              onBlur={() => trigger("website")}
              placeholder="www.exemplo.com.br"
              className={cn(
                errors.website &&
                  "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.website && (
              <p className="text-sm text-destructive">
                {errors.website.message}
              </p>
            )}
          </div>
        </div>
      </FormSection>

      <CompanyContactsSection />

      <FormSection title="Endereço">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={watch("cep") || ""}
              onChange={(e) => {
                handleCEPChange(e);
                handleFieldChange("cep", e.target.value);
              }}
              onBlur={handleCEPBlur}
              placeholder="00000-000"
              className={cn(
                errors.cep &&
                  "border-destructive focus-visible:ring-destructive"
              )}
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
              onChange={(e) => handleFieldChange("street", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input
              id="number"
              {...register("number")}
              onChange={(e) => handleFieldChange("number", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              {...register("complement")}
              onChange={(e) => handleFieldChange("complement", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              {...register("neighborhood")}
              onChange={(e) =>
                handleFieldChange("neighborhood", e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              {...register("city")}
              onChange={(e) => handleFieldChange("city", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <select
              id="state"
              {...register("state")}
              onChange={(e) => handleFieldChange("state", e.target.value)}
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
            <Input
              id="mailbox"
              {...register("mailbox")}
              onChange={(e) => handleFieldChange("mailbox", e.target.value)}
            />
          </div>
        </div>
      </FormSection>

      <CustomFields
        entityType="company"
        register={register}
        watch={watch}
        errors={errors}
        setValue={setValue}
      />
    </form>
  );
}
