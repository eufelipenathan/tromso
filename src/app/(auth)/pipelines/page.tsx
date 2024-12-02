import { PipelineList } from "@/components/pipelines/pipeline-list";

export default function PipelinesPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Pipelines
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Gerencie os funis de vendas e seus estágios
        </p>
      </div>
      <PipelineList />
    </div>
  );
}