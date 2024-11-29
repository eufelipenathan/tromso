import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Check } from 'lucide-react';
import { Contact } from '@/types';
import { useUI } from '@/hooks/useUI';

interface ContactSelectProps {
  value: string;
  onChange: (value: string) => void;
  contacts: Contact[];
  companyId?: string;
  onCreateClick: (initialName: string) => void;
  getCompanyName?: (companyId: string) => string;
  disabled?: boolean;
  disabledMessage?: string;
  hideCreateButton?: boolean;
}

const ContactSelect: React.FC<ContactSelectProps> = ({
  value,
  onChange,
  contacts,
  companyId,
  onCreateClick,
  getCompanyName,
  disabled,
  disabledMessage,
  hideCreateButton = false
}) => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { startLoading, stopLoading } = useUI();

  // Limpa a busca quando a empresa muda ou é removida
  useEffect(() => {
    setSearch('');
    setSearchResults([]);
  }, [companyId]);

  const searchContacts = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const loadingKey = 'search-contacts';
    setIsSearching(true);
    startLoading(loadingKey);

    try {
      // Filtra os contatos localmente primeiro
      const filteredContacts = contacts.filter(contact => {
        // Se temos um companyId, filtra apenas contatos dessa empresa
        if (companyId && contact.companyId !== companyId) {
          return false;
        }

        const searchLower = searchTerm.toLowerCase();
        const nameLower = contact.name.toLowerCase();

        // Busca por correspondência parcial no nome
        return nameLower.includes(searchLower);
      });

      // Ordena os resultados por relevância
      const sortedResults = filteredContacts.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        // Prioriza correspondências que começam com o termo de pesquisa
        const aStartsWith = aName.startsWith(searchLower);
        const bStartsWith = bName.startsWith(searchLower);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!bStartsWith && aStartsWith) return 1;

        // Em seguida, ordena alfabeticamente
        return aName.localeCompare(bName);
      });

      setSearchResults(sortedResults);
    } catch (error) {
      console.error('Erro na busca:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      stopLoading(loadingKey);
    }
  }, [contacts, companyId, startLoading, stopLoading]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (search.trim()) {
      timeoutId = setTimeout(() => {
        searchContacts(search);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [search, searchContacts]);

  // Limpa a busca quando um contato é selecionado
  useEffect(() => {
    if (value) {
      setSearch('');
      setSearchResults([]);
    }
  }, [value]);

  const selectedContact = value ? contacts.find(c => c.id === value) : null;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setSearch(newSearch);
    
    // Se o campo de busca for limpo, não limpa a seleção
    if (!newSearch.trim()) {
      setSearchResults([]);
    }
  };

  const handleCreateClick = () => {
    const searchTerm = search.trim();
    if (searchTerm) {
      onCreateClick(searchTerm);
    }
  };

  const handleClearSelection = () => {
    onChange('');
    setSearch('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        Contato
      </label>

      {/* Campo selecionado */}
      {selectedContact && !search && (
        <div className="relative">
          <div className="flex items-center h-12 px-4 rounded-md border border-blue-200 bg-blue-50">
            <Check className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-blue-700 truncate">
                {selectedContact.name}
              </div>
              {getCompanyName && selectedContact.companyId && (
                <div className="text-xs text-blue-500 truncate mt-0.5">
                  {getCompanyName(selectedContact.companyId)}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="ml-2 text-blue-400 hover:text-blue-600"
              disabled={disabled}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Campo de busca */}
      {(!selectedContact || search) && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            className={`
              block w-full h-12 pl-10 pr-12 rounded-md shadow-sm text-base
              ${disabled 
                ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }
            `}
            placeholder={disabled ? disabledMessage : "Buscar contato..."}
            disabled={disabled}
          />
          {search && !disabled && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-12 flex items-center pr-2"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </button>
          )}
          {!disabled && !hideCreateButton && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button
                type="button"
                onClick={handleCreateClick}
                className="p-1 rounded-md text-gray-400 hover:text-blue-500"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Resultados da busca */}
      {!disabled && (searchResults.length > 0 || isSearching || search.trim()) && (
        <div className="mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {isSearching ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              Buscando...
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {searchResults.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {searchResults.map(contact => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => {
                        onChange(contact.id!);
                      }}
                      className={`
                        w-full px-4 py-4 text-left transition-colors flex items-center
                        ${value === contact.id 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      {value === contact.id && (
                        <Check className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {contact.name}
                        </div>
                        {getCompanyName && contact.companyId && (
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {getCompanyName(contact.companyId)}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {search.trim() && searchResults.length === 0 && (
                <button
                  type="button"
                  onClick={handleCreateClick}
                  className="w-full px-4 py-4 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>
                    Cadastrar "<strong>{search.trim()}</strong>"
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactSelect;