import { useState, useCallback, useEffect, useRef } from 'react';
import { SearchConfig, SearchState, SearchResult } from '../types';
import { calculateItemRelevance } from '../utils/relevance';
import { formatSearchTerm } from '../utils/formatting';

export function useSearch<T extends Record<string, any>>(
  items: T[],
  config: SearchConfig<T>
): SearchState<T> & {
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
} {
  const [state, setState] = useState<SearchState<T>>({
    results: [],
    isSearching: false,
    searchTerm: '',
    error: null
  });

  const debounceTimer = useRef<NodeJS.Timeout>();

  const search = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setState(prev => ({ ...prev, results: [], isSearching: false }));
      return;
    }

    setState(prev => ({ ...prev, isSearching: true }));

    try {
      const formattedTerm = config.formatSearchTerm 
        ? config.formatSearchTerm(searchTerm)
        : formatSearchTerm(searchTerm);

      let searchResults: SearchResult<T>[] = items
        .filter(item => {
          // Aplica filtro customizado se fornecido
          if (config.filter && !config.filter(item)) {
            return false;
          }

          // Busca nos campos configurados
          return config.searchableFields.some(field => {
            const value = item[field];
            if (!value) return false;

            const stringValue = String(value).toLowerCase();
            return stringValue.includes(formattedTerm);
          });
        })
        .map(item => ({
          item,
          relevance: config.calculateRelevance 
            ? config.calculateRelevance(item, formattedTerm)
            : calculateItemRelevance(item, formattedTerm, config.searchableFields)
        }));

      // Ordena por relevância
      searchResults.sort((a, b) => b.relevance - a.relevance);

      setState(prev => ({
        ...prev,
        results: searchResults.map(r => r.item),
        isSearching: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        results: [],
        isSearching: false,
        error: 'Erro ao realizar busca'
      }));
    }
  }, [items, config]);

  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      search(term);
    }, config.debounceTime || 300);
  }, [search, config.debounceTime]);

  const clearSearch = useCallback(() => {
    setState({
      results: [],
      isSearching: false,
      searchTerm: '',
      error: null
    });
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    ...state,
    setSearchTerm,
    clearSearch
  };
}