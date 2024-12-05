import { ContactList } from "@/components/contacts/contact-list";

export default function ContactsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Contatos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gerencie todos os contatos cadastrados no sistema
        </p>
      </div>
      <ContactList />
    </div>
  );
}