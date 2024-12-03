"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormEditor } from "@/components/form-editor/form-editor";
import { SectionDialog } from "@/components/form-editor/section-dialog";
import { useToast } from "@/hooks/use-toast";

export default function FormEditorPage() {
  const [selectedEntity, setSelectedEntity] = useState<string>("company");
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSections();
  }, [selectedEntity]);

  const loadSections = async () => {
    try {
      const response = await fetch(
        `/api/form-sections?entityType=${selectedEntity}`
      );
      if (!response.ok) throw new Error("Falha ao carregar seções");
      const data = await response.json();
      setSections(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar seções",
      });
    }
  };

  const handleCreateSection = async (data: { name: string }) => {
    // Verificar se já existe uma seção com o mesmo nome
    const existingSection = sections.find(
      (section) => section.name.toLowerCase() === data.name.toLowerCase()
    );

    if (existingSection) {
      toast({
        variant: "warning",
        title: "Atenção",
        description:
          "Já existe uma seção com este nome para esta entidade. Por favor, escolha um nome diferente.",
      });
      return;
    }

    try {
      const response = await fetch("/api/form-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          entityType: selectedEntity,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar seção");
      }

      toast({
        title: "Sucesso",
        description: "Seção criada com sucesso",
      });

      setShowSectionDialog(false);
      loadSections();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao criar a seção",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Seções e Campos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure os campos personalizados para cada tipo de entidade
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <Select value={selectedEntity} onValueChange={setSelectedEntity}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione uma entidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="company">Empresas</SelectItem>
            <SelectItem value="contact">Contatos</SelectItem>
            <SelectItem value="deal">Negócios</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => setShowSectionDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Seção
        </Button>
      </div>

      <FormEditor entityType={selectedEntity} />

      <SectionDialog
        open={showSectionDialog}
        onOpenChange={setShowSectionDialog}
        onSubmit={handleCreateSection}
      />
    </div>
  );
}
