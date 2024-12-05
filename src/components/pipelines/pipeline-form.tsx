"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PipelineStages } from "./pipeline-stages";
import { PipelineLostReasons } from "./pipeline-lost-reasons";
import { usePipelineStore } from "@/stores/use-pipeline-store";
import { useEffect } from "react";

const pipelineSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

type PipelineFormData = z.infer<typeof pipelineSchema>;

interface PipelineFormProps {
  initialData?: {
    id: string;
    name: string;
  };
  onSubmit: (data: PipelineFormData & { stages: { name: string }[]; lostReasonIds: string[] }) => Promise<void>;
}

export function PipelineForm({ initialData, onSubmit }: PipelineFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PipelineFormData>({
    resolver: zodResolver(pipelineSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  const reset = usePipelineStore((state) => state.reset);
  const getFormData = usePipelineStore((state) => state.getFormData);

  useEffect(() => {
    // Load pipeline data if editing
    const loadPipelineData = async () => {
      if (initialData?.id) {
        console.log("Loading pipeline data for:", initialData.id);
        
        try {
          // Load stages
          const stagesResponse = await fetch(`/api/pipelines/${initialData.id}/stages`);
          const stagesData = await stagesResponse.json();
          console.log("Loaded stages:", stagesData);

          // Load lost reasons
          const lostReasonsResponse = await fetch(`/api/pipelines/${initialData.id}/lost-reasons`);
          const lostReasonsData = await lostReasonsResponse.json();
          console.log("Loaded lost reasons:", lostReasonsData);

          // Update store
          const setStages = usePipelineStore.getState().setStages;
          const setSelectedLostReasons = usePipelineStore.getState().setSelectedLostReasons;

          setStages(stagesData);
          setSelectedLostReasons(lostReasonsData.map((lr: any) => lr.lostReasonId));
        } catch (error) {
          console.error("Error loading pipeline data:", error);
        }
      }
    };

    loadPipelineData();

    // Reset store when component unmounts
    return () => reset();
  }, [initialData?.id, reset]);

  const handleFormSubmit = async (data: PipelineFormData) => {
    const { stages, lostReasonIds } = getFormData();
    console.log("Submitting pipeline data:", {
      ...data,
      stages,
      lostReasonIds
    });
    await onSubmit({
      ...data,
      stages,
      lostReasonIds
    });
  };

  return (
    <div className="space-y-6">
      <form id="pipeline-form" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="name" className="required">Nome</Label>
          <Input
            id="name"
            {...register("name")}
            className={errors.name && "border-destructive focus-visible:ring-destructive"}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
      </form>

      <Tabs defaultValue="stages">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stages">Estágios</TabsTrigger>
          <TabsTrigger value="lost-reasons">Motivos de Perda</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stages" className="mt-4">
          <PipelineStages />
        </TabsContent>

        <TabsContent value="lost-reasons" className="mt-4">
          <PipelineLostReasons />
        </TabsContent>
      </Tabs>
    </div>
  );
}