import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gerencie as configurações do sistema
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}