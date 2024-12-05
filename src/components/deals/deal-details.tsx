"use client";

import { Deal, Company, Contact, Stage, Pipeline, LostReason } from "@prisma/client";
import { Building2, Mail, Phone, Calendar, DollarSign } from "lucide-react";
import { formatDate, formatCurrency, formatPhone } from "@/lib/utils";
import { DealInteractions } from "./deal-interactions";
import { DealStatus } from "./deal-status";

type DealWithRelations = Deal & {
  company: Company;
  contact: Contact;
  stage: Stage & {
    pipeline: Pipeline;
  };
  lostReason: LostReason | null;
};

interface DealDetailsProps {
  deal: DealWithRelations;
}

export function DealDetails({ deal }: DealDetailsProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {deal.title}
              </h1>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-muted-foreground">
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>{deal.company.name}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="mr-2 h-4 w-4" />
                  <span>{formatCurrency(Number(deal.value))}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Criado em {formatDate(deal.createdAt)}</span>
                </div>
              </div>
            </div>
            <DealStatus deal={deal} />
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <DealInteractions dealId={deal.id} />
          </div>
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-4">
              <h2 className="font-semibold mb-4">Informações do Contato</h2>
              <div className="space-y-2">
                <p className="font-medium">{deal.contact.name}</p>
                {deal.contact.position && (
                  <p className="text-sm text-muted-foreground">
                    {deal.contact.position}
                  </p>
                )}
                {deal.contact.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${deal.contact.email}`}
                      className="text-primary hover:underline"
                    >
                      {deal.contact.email}
                    </a>
                  </div>
                )}
                {deal.contact.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4" />
                    {formatPhone(deal.contact.phone)}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <h2 className="font-semibold mb-4">Pipeline</h2>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {deal.stage.pipeline.name}
                </p>
                <p className="font-medium">{deal.stage.name}</p>
              </div>
            </div>

            {deal.lostReason && (
              <div className="rounded-lg border bg-destructive/10 p-4">
                <h2 className="font-semibold mb-4 text-destructive">
                  Motivo da Perda
                </h2>
                <p className="text-sm text-destructive">
                  {deal.lostReason.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}