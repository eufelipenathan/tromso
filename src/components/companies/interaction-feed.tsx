"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import { Mail, Phone, Calendar, CheckSquare } from "lucide-react";

interface Interaction {
  id: string;
  type: string;
  title: string;
  description: string | null;
  date: string;
  createdAt: string;
}

interface InteractionFeedProps {
  companyId: string;
}

const interactionIcons = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  task: CheckSquare,
};

export function InteractionFeed({ companyId }: InteractionFeedProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInteractions() {
      try {
        const response = await fetch(`/api/companies/${companyId}/interactions`);
        if (!response.ok) {
          throw new Error("Falha ao carregar interações");
        }
        const data = await response.json();
        setInteractions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    }

    loadInteractions();
  }, [companyId]);

  if (isLoading) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Carregando interações...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Nenhuma interação registrada
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction) => {
        const Icon = interactionIcons[interaction.type as keyof typeof interactionIcons];
        return (
          <div
            key={interaction.id}
            className="flex items-start space-x-4 rounded-lg border p-4"
          >
            <div className="rounded-full bg-primary/10 p-2">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{interaction.title}</h3>
                <time className="text-sm text-muted-foreground">
                  {formatDate(new Date(interaction.date))}
                </time>
              </div>
              {interaction.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {interaction.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}