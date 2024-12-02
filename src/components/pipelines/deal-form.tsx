"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Company, Contact, Pipeline, Stage } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const dealSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  value: z.string().min(1, "Valor é obrigatório"),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  contactId: z.string().min(1, "Contato é obrigatório"),
  stageId: z.string().min(1, "Estágio é obrigatório"),
});

type DealFormData = z.infer<typeof dealSchema>;

interface DealFormProps {
  pipeline: Pipeline & {
    stages: Stage[];
  };
  onClose: () => void;
}

export function DealForm({ pipeline, onClose }: DealFormProps) {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
  });

  useEffect(() => {
    async function loadCompanies() {
      const response = await fetch("/api/companies");
      const data = await response.json();
      setCompanies(data);
    }

    loadCompanies();
  }, []);

  useEffect(() => {
    async function loadContacts() {
      if (selectedCompanyId) {
        const response = await fetch(`/api/companies/${selectedCompanyId}/contacts`);
        const data = await response.json();
        setContacts(data);
      } else {
        setContacts([]);
      }
    }

    loadContacts();
  }, [selectedCompanyId]);

  const onSubmit = async (data: DealFormData) => {
    try {
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          value: parseFloat(data.value),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar negócio");
      }

      toast({
        title: "Sucesso",
        description: "Negócio cadastrado com sucesso",
      });
      
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar o negócio",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" {...register("title")} />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Valor</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            min="0"
            {...register("value")}
          />
          {errors.value && (
            <p className="text-sm text-destructive">{errors.value.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Select
            onValueChange={(value) => {
              setValue("companyId", value);
              setSelectedCompanyId(value);
              setValue("contactId", "");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma empresa" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.companyId && (
            <p className="text-sm text-destructive">{errors.companyId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact">Contato</Label>
          <Select
            onValueChange={(value) => setValue("contactId", value)}
            disabled={!selectedCompanyId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um contato" />
            </SelectTrigger>
            <SelectContent>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.contactId && (
            <p className="text-sm text-destructive">{errors.contactId.message}</p>
          )}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="stage">Estágio</Label>
          <Select onValueChange={(value) => setValue("stageId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um estágio" />
            </SelectTrigger>
            <SelectContent>
              {pipeline.stages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.stageId && (
            <p className="text-sm text-destructive">{errors.stageId.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}