"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Company } from "@prisma/client";
import { cn } from "@/lib/utils";
import { contactSchema, type ContactFormData } from "@/lib/validations";
import { phoneMask } from "@/lib/masks";
import { Building2 } from "lucide-react";

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  initialData?: Partial<ContactFormData>;
  selectedCompany?: Company;
}

export function ContactForm({ onSubmit, initialData, selectedCompany }: ContactFormProps) {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      ...initialData,
      companyId: selectedCompany?.id,
    },
  });

  useEffect(() => {
    if (!selectedCompany) {
      loadCompanies();
    }
  }, [selectedCompany]);

  const loadCompanies = async () => {
    const response = await fetch("/api/companies");
    const data = await response.json();
    setCompanies(data);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const masked = phoneMask(value);
    setValue("phone", masked, { shouldValidate: false });
  };

  return (
    <form id="contact-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 grid-cols-2">
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

        {selectedCompany ? (
          <div className="space-y-2">
            <Label>Empresa</Label>
            <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="text-sm">{selectedCompany.name}</span>
            </div>
            <input type="hidden" {...register("companyId")} value={selectedCompany.id} />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="company" className="required">Empresa</Label>
            <select
              {...register("companyId")}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                errors.companyId && "border-destructive focus-visible:ring-destructive"
              )}
            >
              <option value="">Selecione uma empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {errors.companyId && (
              <p className="text-sm text-destructive">{errors.companyId.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="position">Cargo</Label>
          <Input 
            id="position" 
            {...register("position")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            {...register("email")}
            placeholder="exemplo@email.com"
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
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>
    </form>
  );
}