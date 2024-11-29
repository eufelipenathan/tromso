export interface LossReason {
  id?: string;
  name: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  isDeleted?: boolean;
}

export interface PipelineLossReason {
  reasonId: string;
  order: number;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  pipelineId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Pipeline {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  stages: PipelineStage[];
  lossReasons?: PipelineLossReason[];
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  isDeleted?: boolean;
}