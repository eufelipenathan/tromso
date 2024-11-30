export interface GridColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'array' | 'custom';
  format?: (value: any) => string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  section?: string;
  customField?: boolean;
}

export interface GridPreferences {
  id?: string;
  userId: string;
  pageId: string;
  columns?: {
    key: string;
    visible: boolean;
    order: number;
    width?: number | null;
  }[];
  sortBy?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  filters?: {
    key: string;
    operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
    value: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}