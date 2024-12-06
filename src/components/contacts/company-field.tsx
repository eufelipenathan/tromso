'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Building2, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Company {
  id: string;
  name: string;
}

interface CompanyFieldProps {
  mode: 'search' | 'readonly' | 'hidden';
  value?: string;
  selectedCompany?: Company | undefined;
  error?: string;
  onChange: (companyId: string, company?: Company) => void;
}

export function CompanyField({
  mode,
  selectedCompany,
  error,
  onChange,
}: CompanyFieldProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (selectedCompany) {
      setSearchTerm(selectedCompany.name);
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (mode !== 'search' || !searchTerm || selectedCompany) {
      setCompanies([]);
      return;
    }

    const searchCompanies = async () => {
      try {
        const response = await fetch(`/api/companies/search?q=${searchTerm}`);
        if (!response.ok) throw new Error('Falha ao buscar empresas');
        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        console.error('Error searching companies:', error);
        setCompanies([]);
      }
    };

    const debounce = setTimeout(searchCompanies, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, mode, selectedCompany]);

  const handleClearCompany = () => {
    onChange('', undefined);
    setSearchTerm('');
    setShowResults(false);
  };

  if (mode === 'hidden') return null;

  return (
    <div className="space-y-2">
      <Label htmlFor="company" className="required">
        Empresa
      </Label>
      <div className="relative">
        {mode === 'readonly' && selectedCompany ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-full pl-2 pr-1 py-1">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">
                {selectedCompany.name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full hover:bg-primary/20"
                onClick={handleClearCompany}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {!selectedCompany && (
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            )}
            {selectedCompany ? (
              <div className="flex items-center gap-2 h-9 px-3 rounded-md border bg-muted">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedCompany.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={handleClearCompany}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Input
                id="company"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (!e.target.value) {
                    onChange('', undefined);
                  }
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className={cn(
                  'pl-9',
                  error && 'border-destructive focus-visible:ring-destructive',
                )}
                placeholder="Buscar empresa..."
              />
            )}
          </>
        )}

        {showResults && companies.length > 0 && !selectedCompany && (
          <div className="fixed left-0 right-0 z-[9999] w-full mt-1 bg-popover border rounded-md shadow-md py-1 mx-auto max-w-[768px]">
            {companies.map((company) => (
              <button
                key={company.id}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-accent text-sm"
                onClick={() => {
                  onChange(company.id, company);
                  setSearchTerm(company.name);
                  setShowResults(false);
                }}
              >
                {company.name}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
