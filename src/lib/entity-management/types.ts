export interface BaseField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'array' | 'currency';
  required?: boolean;
  section: string;
  format?: (value: any, index?: number) => any;
}

export interface EntityCreationResult<T> {
  id: string;
  entity: T;
}

export interface EntityCreationHook<T> {
  createEntity: (data: Partial<T>) => Promise<EntityCreationResult<T> | null>;
  error: string | null;
  loading: boolean;
}

export interface EntitySelectionHook<T> {
  selectedEntity: T | null;
  setSelectedEntity: (entity: T | null) => void;
  handleEntityCreated: (id: string, entity: T) => Promise<T>;
  handleEntitySelected: (id: string) => void;
  clearSelection: () => void;
}

export interface EntitySearchHook<T> {
  searchResults: T[];
  isSearching: boolean;
  search: string;
  setSearch: (value: string) => void;
  handleSearch: (term: string) => Promise<void>;
  clearSearch: () => void;
}

export type SupportedEntity = Company | Contact;

export interface EntityManagementConfig<T extends SupportedEntity> {
  collectionName: string;
  baseFields: BaseField[];
  generateSearchTokens: (entity: Partial<T>) => string[];
  validateEntity: (entity: Partial<T>) => boolean;
  formatEntity: (data: Partial<T>) => Partial<T>;
}