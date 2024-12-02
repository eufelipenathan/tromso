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
      className="block bg-card rounded-lg border p-4 hover:border-primary transition-colors shadow-sm"
    >
      <h4 className="font-medium text-sm mb-2 line-clamp-2">{deal.title}</h4>
      <p className="text-sm font-medium text-primary mb-3">
        {formatCurrency(Number(deal.value))}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center text-xs text-muted-foreground">
          <Building2 className="mr-2 h-3.5 w-3.5" />
          <span className="truncate">{deal.company.name}</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <User className="mr-2 h-3.5 w-3.5" />
          <span className="truncate">{deal.contact.name}</span>
        </div>
      </div>
    </Link>
  );
}