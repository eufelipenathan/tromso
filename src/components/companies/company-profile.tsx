"use client";

import { Company, Contact, Deal } from "@prisma/client";
import { Building2, Mail, Phone, Globe, Calendar } from "lucide-react";
import { formatDate, formatPhone } from "@/lib/utils";
import { CompanyInteractions } from "./company-interactions";
import { CompanyContacts } from "./company-contacts";
import { CompanyDeals } from "./company-deals";

interface CompanyProfileProps {
  company: Company & {
    contacts: Contact[];
    deals: Array<Deal & {
      stage: {
        pipeline: {
          name: string;
        };
      };
    }>;
  };
}

export function CompanyProfile({ company }: CompanyProfileProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {company.name}
              </h1>
              <div className="mt-4 space-y-2">
                {company.email && (
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4" />
                    <a
                      href={`mailto:${company.email}`}
                      className="hover:text-foreground"
                    >
                      {company.email}
                    </a>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>{formatPhone(company.phone)}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center text-muted-foreground">
                    <Globe className="mr-2 h-4 w-4" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Cadastrado em {formatDate(company.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            <CompanyInteractions companyId={company.id} />
            <CompanyDeals deals={company.deals} />
          </div>
          <div>
            <CompanyContacts
              companyId={company.id}
              contacts={company.contacts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}