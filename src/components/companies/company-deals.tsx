"use client";

import { Deal } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CompanyDealsProps {
  deals: Array<Deal & {
    stage: {
      pipeline: {
        name: string;
      };
    };
  }>;
}

export function CompanyDeals({ deals }: CompanyDealsProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Negócios</h2>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Novo Negócio
        </Button>
      </div>
      <div className="p-4">
        {deals.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            Nenhum negócio cadastrado
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="flex items-start justify-between rounded-lg border p-4"
              >
                <div>
                  <h3 className="font-medium">{deal.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {deal.stage.pipeline.name}
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {formatCurrency(Number(deal.value))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}