"use client";

import { Contact } from "@prisma/client";
import { Edit2, X, Mail, Phone, Briefcase, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPhone } from "@/lib/utils";

interface ContactCardProps {
  contact: Contact;
  onEdit: (e: React.MouseEvent) => void;
  onRemove: (e: React.MouseEvent) => void;
}

export function ContactCard({ contact, onEdit, onRemove }: ContactCardProps) {
  return (
    <div className="col-span-2 flex items-center justify-between h-10 px-3 border rounded-lg bg-card">
      <div className="flex items-center gap-4 overflow-hidden min-w-0">
        <div className="flex items-center gap-1.5 min-w-[120px] max-w-[180px]">
          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">{contact.name}</span>
        </div>

        {contact.position && (
          <div className="flex items-center text-xs text-muted-foreground min-w-0">
            <Briefcase className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            <span className="truncate max-w-[120px]">{contact.position}</span>
          </div>
        )}

        {contact.email && (
          <div className="flex items-center min-w-0">
            <Mail className="mr-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <a
              href={`mailto:${contact.email}`}
              className="text-xs text-primary hover:underline truncate max-w-[180px]"
            >
              {contact.email}
            </a>
          </div>
        )}

        {contact.phone && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Phone className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{formatPhone(contact.phone)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 ml-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-muted"
          onClick={onEdit}
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
