export interface SearchResult<T> {
  item: T;
  relevance: number;
}

export interface SearchConfig<T> {
  // Campos a serem pesquisados no item
  searchableFields: (keyof T)[];
  
  // Função opcional para filtrar resultados
  filter?: (item: T) => boolean;
  
  // Função opcional para customizar o cálculo de relevância
  calculateRelevance?: (item: T, searchTerm: string) => number;
  
  // Função opcional para formatar o texto antes da busca
  formatSearchTerm?: (term: string) => string;
  
  // Delay em ms para debounce da busca
  debounceTime?: number;
}

export interface SearchState<T> {
  results: T[];
  isSearching: boolean;
  searchTerm: string;
  error: string | null;
}