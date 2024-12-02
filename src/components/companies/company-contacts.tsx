"use client";

import { useState } from "react";
import { Contact } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone } from "lucide-react";
import { ContactForm } from "./contact-form";
import { formatPhone } from "@/lib/utils";

interface CompanyContactsProps {
  companyId: string;
  contacts: Contact[];
}

export function CompanyContacts({ companyId, contacts }: CompanyContactsProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Contatos</h2>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Contato
        </Button>
      </div>
      <div className="p-4">
        {showForm && (
          <div className="mb-6">
            <ContactForm
              companyId={companyId}
              onClose={() => setShowForm(false)}
            />
          </div>
        )}
        
        {contacts.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            Nenhum contato cadastrado
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-start justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <h3 className="font-medium">{contact.name}</h3>
                  {contact.position && (
                    <p className="text-sm text-muted-foreground">
                      {contact.position}
                    </p>
                  )}
                  {contact.email && (
                    <div className="flex items-center text-sm text-primary">
                      <Mail className="mr-2 h-4 w-4" />
                      <a
                        href={`mailto:${contact.email}`}
                        className="hover:underline"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="mr-2 h-4 w-4" />
                      {formatPhone(contact.phone)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}