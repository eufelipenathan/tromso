import { LostReasonList } from "@/components/lost-reasons/lost-reason-list";

export default function LostReasonsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Motivos de Perda</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gerencie os motivos de perda de negócios
        </p>
      </div>
      <LostReasonList />
    </div>
  );
}