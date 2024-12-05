"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const lostReasonSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

type LostReasonFormData = z.infer<typeof lostReasonSchema>;

interface LostReasonFormProps {
  initialData?: { name: string };
  onSubmit: (data: LostReasonFormData) => Promise<void>;
}

export function LostReasonForm({ initialData, onSubmit }: LostReasonFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LostReasonFormData>({
    resolver: zodResolver(lostReasonSchema),
    defaultValues: initialData,
  });

  return (
    <form id="lost-reason-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
  );
}