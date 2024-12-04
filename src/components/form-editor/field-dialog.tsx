"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";

const fieldSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  required: z.boolean().default(false),
  fullWidth: z.boolean().default(false),
  options: z.string().optional(),
  multiple: z.boolean().default(false),
  visible: z.boolean().default(true),
  editable: z.boolean().default(true),
});

type FieldFormData = z.infer<typeof fieldSchema>;

interface FieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FieldFormData) => Promise<void>;
  initialData?: Partial<FieldFormData>;
  existingFields?: { name: string }[];
}

const fieldTypes = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Telefone" },
  { value: "date", label: "Data" },
  { value: "select", label: "Seleção" },
  { value: "textarea", label: "Área de Texto" },
];

export function FieldDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  existingFields = [],
}: FieldDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "",
      required: initialData?.required || false,
      fullWidth: initialData?.fullWidth || false,
      options: initialData?.options || "",
      multiple: initialData?.multiple || false,
      visible: initialData?.visible ?? true,
      editable: initialData?.editable ?? true,
    },
  });

  const selectedType = watch("type");

  const handleFormSubmit = async (data: FieldFormData) => {
    const fieldExists = existingFields.some(
      (field) =>
        field.name.toLowerCase() === data.name.toLowerCase() &&
        (!initialData ||
          initialData.name?.toLowerCase() !== data.name.toLowerCase())
    );

    if (fieldExists) {
      toast({
        variant: "warning",
        title: "Atenção",
        description:
          "Já existe um campo com este nome nesta seção. Por favor, escolha um nome diferente.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Campo" : "Novo Campo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => setValue("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">
                  {errors.type.message}
                </p>
              )}
            </div>

            {selectedType === "select" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="options">Opções (uma por linha)</Label>
                  <textarea
                    id="options"
                    className="min-h-[100px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
                    {...register("options")}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="multiple"
                    checked={watch("multiple")}
                    onCheckedChange={(checked) => setValue("multiple", checked)}
                  />
                  <Label htmlFor="multiple">Permitir múltipla seleção</Label>
                </div>
              </div>
            )}

            <div className="border-t" />

            <Button
              type="button"
              variant="outline"
              className="w-full justify-between"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>Configurações avançadas</span>
              {showAdvanced ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {showAdvanced && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="required">Obrigatório</Label>
                        <Switch
                          id="required"
                          checked={watch("required")}
                          onCheckedChange={(checked) =>
                            setValue("required", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="fullWidth">Ocupar duas colunas</Label>
                        <Switch
                          id="fullWidth"
                          checked={watch("fullWidth")}
                          onCheckedChange={(checked) =>
                            setValue("fullWidth", checked)
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="visible">Visível</Label>
                        <Switch
                          id="visible"
                          checked={watch("visible")}
                          onCheckedChange={(checked) =>
                            setValue("visible", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="editable">Editável</Label>
                        <Switch
                          id="editable"
                          checked={watch("editable")}
                          onCheckedChange={(checked) =>
                            setValue("editable", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
