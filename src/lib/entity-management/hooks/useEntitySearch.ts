import { useState, useCallback, useEffect } from 'react';
import { EntitySearchHook, SupportedEntity } from '../types';

export function useEntitySearch<T extends SupportedEntity>(
  entities: T[],
  searchFields: (keyof T)[],
  filterFn?: (entity: T) => boolean
): EntitySearchHook<T> {
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const searchLower = searchTerm.toLowerCase();
      const words = searchLower.split(' ').filter(word => word.length > 0);

      let filteredEntities = entities.filter(entity => {
        // Apply custom filter if provided
        if (filterFn && !filterFn(entity)) {
          return false;
        }

        // Search in specified fields
        return searchFields.some(field => {
          const value = entity[field];
          if (!value) return false;

          const stringValue = String(value).toLowerCase();
          return words.some(word => stringValue.includes(word));
        });
      });

      // Sort results by relevance
      filteredEntities = filteredEntities.sort((a, b) => {
        const aValue = String(a[searchFields[0]]).toLowerCase();
        const bValue = String(b[searchFields[0]]).toLowerCase();
        
        const aStartsWith = aValue.startsWith(searchLower);
        const bStartsWith = bValue.startsWith(searchLower);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        return aValue.localeCompare(bValue);
      });

      setSearchResults(filteredEntities);
    } finally {
      setIsSearching(false);
    }
  }, [entities, searchFields, filterFn]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (search.trim()) {
      timeoutId = setTimeout(() => {
        handleSearch(search);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [search, handleSearch]);

  const clearSearch = useCallback(() => {
    setSearch('');
    setSearchResults([]);
  }, []);

  return {
    searchResults,
    isSearching,
    search,
    setSearch,
    handleSearch,
    clearSearch
  };
}