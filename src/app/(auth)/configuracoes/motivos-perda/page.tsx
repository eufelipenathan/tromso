import { LostReasonList } from "@/components/lost-reasons/lost-reason-list";

export default function LostReasonsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Motivos de Perda
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Gerencie os motivos de perda de negócios
        </p>
      </div>
      <LostReasonList />
    </div>
  );
}