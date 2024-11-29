import React, { useEffect } from 'react';
import { Plus, Search, X, Check } from 'lucide-react';
import { Company } from '@/types';
import { useSearch } from '@/lib/search';
import { useFormStyles } from './styles/useFormStyles';

interface CompanySelectProps {
  value: string;
  onChange: (value: string) => void;
  companies: Company[];
  onCreateClick: (initialName: string) => void;
  hideCreateButton?: boolean;
}

const CompanySelect: React.FC<CompanySelectProps> = ({
  value,
  onChange,
  companies,
  onCreateClick,
  hideCreateButton = false,
}) => {
  const styles = useFormStyles();
  const {
    results: searchResults,
    isSearching,
    searchTerm,
    setSearchTerm,
    clearSearch,
  } = useSearch(companies, {
    searchableFields: ['name', 'legalName', 'cnpj'],
    debounceTime: 300,
    formatSearchTerm: (term) => term.replace(/[^\w\s]/g, '').toLowerCase(),
  });

  const selectedCompany = value ? companies.find((c) => c.id === value) : null;

  useEffect(() => {
    if (value) {
      clearSearch();
    }
  }, [value, clearSearch]);

  const handleCreateClick = () => {
    const term = searchTerm.trim();
    if (term) {
      onCreateClick(term);
    }
  };

  return (
    <div className="space-y-1">
      <label className={styles.label}>
        Empresa
        <span className="text-red-500 ml-1">*</span>
      </label>

      {selectedCompany && !searchTerm && (
        <div className="relative">
          <div className="flex items-center h-12 px-4 rounded-md border border-gray-200 shadow-sm bg-gray-50">
            <Check className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {selectedCompany.name}
              </div>
              {(selectedCompany.legalName || selectedCompany.cnpj) && (
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  {[selectedCompany.legalName, selectedCompany.cnpj]
                    .filter(Boolean)
                    .join(' • ')}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                onChange('');
                clearSearch();
              }}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {(!selectedCompany || searchTerm) && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${styles.input} pl-10 pr-12`}
            placeholder="Buscar empresa..."
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-12 flex items-center pr-2"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </button>
          )}
          {!hideCreateButton && (
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

      {(searchResults.length > 0 || isSearching || searchTerm.trim()) && (
        <div className="mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {isSearching ? (
            <div className="px-4 py-3 text-sm text-gray-500">Buscando...</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {searchResults.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => {
                        onChange(company.id!);
                        clearSearch();
                      }}
                      className={`
                        w-full px-4 py-4 text-left transition-colors flex items-center
                        ${
                          value === company.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      {value === company.id && (
                        <Check className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {company.name}
                        </div>
                        {(company.legalName || company.cnpj) && (
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {[company.legalName, company.cnpj]
                              .filter(Boolean)
                              .join(' • ')}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchTerm.trim() && searchResults.length === 0 && (
                <button
                  type="button"
                  onClick={handleCreateClick}
                  className="w-full px-4 py-4 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>
                    Cadastrar "<strong>{searchTerm.trim()}</strong>"
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

export default CompanySelect;