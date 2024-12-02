"use client";

import { Deal, Company, Contact } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";
import { Building2, User } from "lucide-react";
import Link from "next/link";

interface DealCardProps {
  deal: Deal & {
    company: Company;
    contact: Contact;
  };
  onDragStart: (e: React.DragEvent) => void;
}

export function DealCard({ deal, onDragStart }: DealCardProps) {
  return (
    <Link
      href={`/negocios/${deal.id}`}
      draggable
      onDragStart={onDragStart}
      className="block bg-background rounded-lg border p-4 hover:border-primary transition-colors"
    >
      <h4 className="font-medium mb-2">{deal.title}</h4>
      <p className="text-sm font-medium text-primary mb-2">
        {formatCurrency(Number(deal.value))}
      </p>
      <div className="space-y-1">
        <div className="flex items-center text-sm text-muted-foreground">
          <Building2 className="mr-2 h-4 w-4" />
          {deal.company.name}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="mr-2 h-4 w-4" />
          {deal.contact.name}
        </div>
      </div>
    </Link>
  );
}