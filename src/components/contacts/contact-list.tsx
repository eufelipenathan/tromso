"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContactForm } from "./contact-form";
import { ContactTable } from "./contact-table";

export function ContactList() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Contato
        </Button>
      </div>

      {showForm && <ContactForm onClose={() => setShowForm(false)} />}
      <ContactTable />
    </div>
  );
}