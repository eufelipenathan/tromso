export interface CacheItem<T> {
  value: T;
  timestamp: number;
}

export interface StorageConfig {
  basePath: string;
  maxSize?: number;
  allowedTypes?: string[];
}