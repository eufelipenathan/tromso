"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Company } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";
import { phoneMask } from "@/lib/masks";
import { contactSchema, ContactFormData } from "@/lib/validations"; // Import the contactSchema

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  initialData?: Partial<ContactFormData>;
  selectedCompany?: Company;
}

export function ContactForm({
  onSubmit,
  initialData,
  selectedCompany,
}: ContactFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleFormSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        position: data.position || null,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar o contato",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const masked = phoneMask(value);
    setValue("phone", masked, { shouldValidate: false });
  };

  useEffect(() => {
    if (selectedCompany) {
      setValue("companyId", selectedCompany.id);
    }
  }, [selectedCompany, setValue]);

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="required">
            Nome
          </Label>
          <Input
            id="name"
            {...register("name")}
            className={cn(
              errors.name && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Cargo</Label>
          <Input id="position" {...register("position")} />
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

        {selectedCompany && (
          <div className="col-span-2 space-y-2">
            <Label>Empresa</Label>
            <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="text-sm">{selectedCompany.name}</span>
            </div>
            <input
              type="hidden"
              {...register("companyId")}
              value={selectedCompany.id}
            />
          </div>
        )}
      </div>
    </form>
  );
}
