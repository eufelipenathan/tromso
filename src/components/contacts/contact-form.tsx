"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { Company } from "@prisma/client";
import { CompanyForm } from "@/components/companies/company-form";
import { FormModal } from "@/components/ui/form-modal";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { contactSchema, type ContactFormData } from "@/lib/validations";
import { phoneMask } from "@/lib/masks";

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
}

export function ContactForm({ onSubmit }: ContactFormProps) {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompanyList, setShowCompanyList] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    loadCompanies();

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowCompanyList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
      setShowCompanyList(true);
    } else {
      setFilteredCompanies([]);
      setShowCompanyList(false);
    }
  }, [searchTerm, companies]);

  const loadCompanies = async () => {
    const response = await fetch("/api/companies");
    const data = await response.json();
    setCompanies(data);
  };

  const handleCompanySubmit = async (data: any) => {
    try {
      setIsSubmittingCompany(true);

      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar empresa");
      }

      const newCompany = await response.json();
      
      setCompanies((prev) => [...prev, newCompany]);
      handleCompanySelect(newCompany);
      setShowCompanyForm(false);

      toast({
        title: "Sucesso",
        description: "Empresa cadastrada com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar a empresa",
      });
    } finally {
      setIsSubmittingCompany(false);
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setValue("companyId", company.id);
    setSearchTerm(company.name);
    setShowCompanyList(false);
  };

  const handleCreateCompany = () => {
    setShowCompanyForm(true);
    setShowCompanyList(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const masked = phoneMask(value);
    setValue("phone", masked, { shouldValidate: false });
  };

  return (
    <>
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

          <div className="space-y-2">
            <Label htmlFor="company" className="required">Empresa</Label>
            <div className="relative" ref={searchRef}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowCompanyList(true)}
                    className={cn(
                      "pl-9",
                      errors.companyId && "border-destructive focus-visible:ring-destructive"
                    )}
                    placeholder="Buscar empresa..."
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCreateCompany}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {showCompanyList && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        className={cn(
                          "w-full px-4 py-2 text-left hover:bg-muted text-sm",
                          selectedCompany?.id === company.id && "bg-muted"
                        )}
                        onClick={() => handleCompanySelect(company)}
                      >
                        {company.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      {searchTerm ? (
                        <div className="flex flex-col gap-2">
                          <span>Nenhuma empresa encontrada</span>
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-primary justify-start"
                            onClick={handleCreateCompany}
                          >
                            Clique aqui para cadastrar
                          </Button>
                        </div>
                      ) : (
                        "Digite para buscar empresas"
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.companyId && (
              <p className="text-sm text-destructive">{errors.companyId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Input 
              id="position" 
              {...register("position")}
              className={cn(errors.position && "border-destructive focus-visible:ring-destructive")}
            />
            {errors.position && (
              <p className="text-sm text-destructive">{errors.position.message}</p>
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
        </div>
      </form>

      <FormModal
        open={showCompanyForm}
        onClose={() => setShowCompanyForm(false)}
        title="Nova Empresa"
        isSubmitting={isSubmittingCompany}
      >
        <CompanyForm 
          onSubmit={handleCompanySubmit} 
          initialData={{ name: searchTerm }}
        />
      </FormModal>
    </>
  );
}