"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const interactionSchema = z.object({
  type: z.enum(["email", "call", "meeting", "task"]),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  date: z.string().min(1, "Data é obrigatória"),
});

type InteractionFormData = z.infer<typeof interactionSchema>;

interface InteractionFormProps {
  companyId: string;
  onClose: () => void;
}

export function InteractionForm({ companyId, onClose }: InteractionFormProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
  });

  const onSubmit = async (data: InteractionFormData) => {
    try {
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          companyId,
          date: new Date(data.date).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar interação");
      }

      toast({
        title: "Sucesso",
        description: "Interação registrada com sucesso",
      });
      
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao registrar a interação",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select onValueChange={(value) => setValue("type", value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="call">Ligação</SelectItem>
              <SelectItem value="meeting">Reunião</SelectItem>
              <SelectItem value="task">Tarefa</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-destructive">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="datetime-local"
            {...register("date")}
          />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" {...register("title")} />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            {...register("description")}
            rows={4}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
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