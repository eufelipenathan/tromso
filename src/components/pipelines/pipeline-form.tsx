"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const pipelineSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  stages: z.array(z.object({
    name: z.string().min(1, "Nome do estágio é obrigatório"),
  })).min(1, "Adicione pelo menos um estágio"),
});

type PipelineFormData = z.infer<typeof pipelineSchema>;

interface PipelineFormProps {
  onClose: () => void;
}

export function PipelineForm({ onClose }: PipelineFormProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<PipelineFormData>({
    resolver: zodResolver(pipelineSchema),
    defaultValues: {
      stages: [{ name: "" }],
    },
  });

  const stages = watch("stages");

  const addStage = () => {
    setValue("stages", [...stages, { name: "" }]);
  };

  const removeStage = (index: number) => {
    if (stages.length > 1) {
      setValue(
        "stages",
        stages.filter((_, i) => i !== index)
      );
    }
  };

  const onSubmit = async (data: PipelineFormData) => {
    try {
      const response = await fetch("/api/pipelines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar pipeline");
      }

      toast({
        title: "Sucesso",
        description: "Pipeline cadastrado com sucesso",
      });
      
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar o pipeline",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Pipeline</Label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Estágios</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addStage}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Estágio
            </Button>
          </div>

          {stages.map((_, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Nome do estágio"
                  {...register(`stages.${index}.name`)}
                />
                {errors.stages?.[index]?.name && (
                  <p className="text-sm text-destructive">
                    {errors.stages[index]?.name?.message}
                  </p>
                )}
              </div>
              {stages.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeStage(index)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          {errors.stages && (
            <p className="text-sm text-destructive">{errors.stages.message}</p>
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