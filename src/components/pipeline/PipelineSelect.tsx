import React from 'react';
import { Pipeline } from '@/types/pipeline';
import * as Icons from 'lucide-react';
import { ChevronDown } from 'lucide-react';

interface PipelineSelectProps {
  value: string;
  onChange: (value: string) => void;
  pipelines: Pipeline[];
}

const PipelineSelect: React.FC<PipelineSelectProps> = ({
  value,
  onChange,
  pipelines
}) => {
  const sortedPipelines = [...pipelines].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 pl-14 pr-12 min-w-[200px] rounded-lg border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500 appearance-none shadow-sm"
      >
        {sortedPipelines.map(pipeline => (
          <option key={pipeline.id} value={pipeline.id}>
            {pipeline.name}
          </option>
        ))}
      </select>

      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        {(() => {
          const pipeline = pipelines.find(p => p.id === value);
          const Icon = pipeline?.icon 
            ? Icons[pipeline.icon as keyof typeof Icons]
            : Icons.Banknote;
          return (
            <Icon className="h-7 w-7 text-gray-600" />
          );
        })()}
      </div>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
};

export default PipelineSelect;