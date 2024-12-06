"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useRef } from "react";
import { Company, Contact, Pipeline, Stage } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Building2, User } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { CompanyForm } from "@/components/companies/company-form";
import { ContactForm } from "@/components/contacts/contact-form";
import { cn } from "@/lib/utils";
import { CustomFields } from "@/components/form/custom-fields";
import { handleFormSubmitWithPropagation } from "@/lib/event-handlers";
import { FORM_MODES } from "@/lib/form-modes";

const dealSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  value: z.string().optional(),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  contactId: z.string().min(1, "Contato é obrigatório"),
  pipelineId: z.string().min(1, "Pipeline é obrigatório"),
  stageId: z.string().min(1, "Estágio é obrigatório"),
});

type DealFormData = z.infer<typeof dealSchema>;

interface DealFormProps {
  pipeline: Pipeline & { stages: Stage[] };
  pipelines: Pipeline[];
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  onPipelineChange: (pipelineId: string) => void;
}

export function DealForm({
  pipeline,
  pipelines,
  onClose,
  onSubmit,
  onPipelineChange,
}: DealFormProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [showCompanyList, setShowCompanyList] = useState(false);
  const [showContactList, setShowContactList] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const companySearchRef = useRef<HTMLDivElement>(null);
  const contactSearchRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      pipelineId: pipeline.id,
      stageId: pipeline.stages[0]?.id,
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    loadCompanies();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        companySearchRef.current &&
        !companySearchRef.current.contains(event.target as Node)
      ) {
        setShowCompanyList(false);
      }
      if (
        contactSearchRef.current &&
        !contactSearchRef.current.contains(event.target as Node)
      ) {
        setShowContactList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (companySearchTerm) {
      const filtered = companies.filter((company) =>
        company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
      setShowCompanyList(true);
    } else {
      setFilteredCompanies([]);
      setShowCompanyList(false);
    }
  }, [companySearchTerm, companies]);

  useEffect(() => {
    if (selectedCompany && contactSearchTerm) {
      const filtered = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(contactSearchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
      setShowContactList(true);
    } else {
      setFilteredContacts([]);
      setShowContactList(false);
    }
  }, [contactSearchTerm, contacts, selectedCompany]);

  const loadCompanies = async () => {
    const response = await fetch("/api/companies");
    const data = await response.json();
    setCompanies(data);
  };

  const loadContacts = async (companyId: string) => {
    const response = await fetch(`/api/companies/${companyId}/contacts`);
    const data = await response.json();
    setContacts(data);
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setSelectedContact(null);
    setValue("companyId", company.id);
    setValue("contactId", "");
    setCompanySearchTerm(company.name);
    setContactSearchTerm("");
    setShowCompanyList(false);
    loadContacts(company.id);
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setValue("contactId", contact.id);
    setContactSearchTerm(contact.name);
    setShowContactList(false);
  };

  const handleCompanySubmit = async (data: any) => {
    try {
      setIsSubmittingCompany(true);
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Erro ao cadastrar empresa");

      const newCompany = await response.json();
      setCompanies((prev) => [...prev, newCompany]);
      handleCompanySelect(newCompany);
      setShowCompanyForm(false);
    } finally {
      setIsSubmittingCompany(false);
    }
  };

  const handleContactSubmit = async (data: any) => {
    try {
      setIsSubmittingContact(true);
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Erro ao cadastrar contato");

      const newContact = await response.json();
      setContacts((prev) => [...prev, newContact]);
      handleContactSelect(newContact);
      setShowContactForm(false);
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handlePipelineChange = (pipelineId: string) => {
    setValue("pipelineId", pipelineId);
    const selectedPipeline = pipelines.find((p) => p.id === pipelineId);
    if (selectedPipeline?.stages[0]) {
      setValue("stageId", selectedPipeline.stages[0].id);
    }
    onPipelineChange(pipelineId);
  };

  const formatValue = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "");
    const amount = parseInt(onlyNumbers, 10) / 100;
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setValue("value", value);
    e.target.value = formatValue(value);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    await handleFormSubmitWithPropagation<DealFormData>(
      e,
      "deal-form",
      async (data) => {
        await onSubmit({
          ...data,
          value: parseFloat(data.value || "0") / 100,
        });
      },
      undefined,
      (error) => console.error("Erro ao processar formulário:", error)
    );
  };

  return (
    <>
      <form
        id="deal-form"
        onSubmit={handleFormSubmit}
        className="space-y-6"
      >
        <div className="grid gap-4 grid-cols-2">
          <div className="col-span-1 space-y-2">
            <Label htmlFor="title" className="required">
              Título
            </Label>
            <Input
              id="title"
              {...register("title")}
              className={cn(
                errors.title &&
                  "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="required">
              Empresa
            </Label>
            <div className="relative" ref={companySearchRef}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  {selectedCompany ? (
                    <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCompany.name}</span>
                    </div>
                  ) : (
                    <>
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={companySearchTerm}
                        onChange={(e) => {
                          setCompanySearchTerm(e.target.value);
                          if (!e.target.value) {
                            setSelectedCompany(null);
                            setSelectedContact(null);
                            setValue("companyId", "");
                            setValue("contactId", "");
                            setContactSearchTerm("");
                          }
                        }}
                        className={cn(
                          "pl-9",
                          errors.companyId &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                        placeholder="Buscar empresa..."
                      />
                    </>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setShowCompanyForm(true);
                    setShowCompanyList(false);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {showCompanyList && !selectedCompany && companySearchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-muted text-sm"
                        onClick={() => handleCompanySelect(company)}
                      >
                        {company.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      <div className="flex flex-col gap-2">
                        <span>Nenhuma empresa encontrada</span>
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto p-0 text-primary justify-start"
                          onClick={() => {
                            setShowCompanyForm(true);
                            setShowCompanyList(false);
                          }}
                        >
                          Clique aqui para cadastrar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.companyId && (
              <p className="text-sm text-destructive">
                {errors.companyId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact" className="required">
              Contato
            </Label>
            <div className="relative" ref={contactSearchRef}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  {selectedContact ? (
                    <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedContact.name}</span>
                    </div>
                  ) : (
                    <>
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text -y-1/2 text-muted-foreground" />
                      <Input
                        value={contactSearchTerm}
                        onChange={(e) => {
                          setContactSearchTerm(e.target.value);
                          if (!e.target.value) {
                            setSelectedContact(null);
                            setValue("contactId", "");
                          }
                        }}
                        className={cn(
                          "pl-9",
                          errors.contactId &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                        placeholder={
                          selectedCompany
                            ? "Buscar contato..."
                            : "Selecione uma empresa primeiro"
                        }
                        disabled={!selectedCompany}
                      />
                    </>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setShowContactForm(true);
                    setShowContactList(false);
                  }}
                  disabled={!selectedCompany}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {showContactList && !selectedContact && contactSearchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <button
                        key={contact.id}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-muted text-sm"
                        onClick={() => handleContactSelect(contact)}
                      >
                        {contact.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      <div className="flex flex-col gap-2">
                        <span>Nenhum contato encontrado</span>
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto p-0 text-primary justify-start"
                          onClick={() => {
                            setShowContactForm(true);
                            setShowContactList(false);
                          }}
                        >
                          Clique aqui para cadastrar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.contactId && (
              <p className="text-sm text-destructive">
                {errors.contactId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Valor</Label>
            <Input
              id="value"
              onChange={handleValueChange}
              className={cn(
                errors.value &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              placeholder="R$ 0,00"
            />
            {errors.value && (
              <p className="text-sm text-destructive">{errors.value.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pipeline" className="required">
              Pipeline
            </Label>
            <Select
              value={watch("pipelineId")}
              onValueChange={handlePipelineChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um pipeline" />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.pipelineId && (
              <p className="text-sm text-destructive">
                {errors.pipelineId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage" className="required">
              Estágio
            </Label>
            <Select
              value={watch("stageId")}
              onValueChange={(value) => setValue("stageId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um estágio" />
              </SelectTrigger>
              <SelectContent>
                {pipelines
                  .find((p) => p.id === watch("pipelineId"))
                  ?.stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.stageId && (
              <p className="text-sm text-destructive">
                {errors.stageId.message}
              </p>
            )}
          </div>
        </div>

        <CustomFields
          entityType="deal"
          register={register}
          watch={watch}
          errors={errors}
          setValue={setValue}
        />
      </form>

      <FormModal
        open={showCompanyForm}
        onClose={() => setShowCompanyForm(false)}
        title="Nova Empresa"
        isSubmitting={isSubmittingCompany}
        formId="company-form"
      >
        <CompanyForm onSubmit={handleCompanySubmit} />
      </FormModal>

      <FormModal
        open={showContactForm}
        onClose={() => setShowContactForm(false)}
        title="Novo Contato"
        isSubmitting={isSubmittingContact}
        formId="contact-form"
      >
        <ContactForm
          onSubmit={handleContactSubmit}
          initialData={{ name: contactSearchTerm }}
          selectedCompany={selectedCompany!}
          mode={FORM_MODES.DEAL}
        />
      </FormModal>
    </>
  );
}