import { useState, useEffect } from 'react';
import { Company } from '@/types';
import { useCompanies } from '@/hooks/companies';
import { useGridPreferences } from '@/hooks/useGridPreferences';
import { CompanyForm } from '@/features/companies/components/CompanyForm';
import { CompanyList } from '@/features/companies/components/CompanyList';
import Modal from '@/components/Modal';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import LoadingState from '@/components/LoadingState';

function Companies() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const { companies, isLoading, loadCompanies, createCompany, updateCompany, deleteCompany } = useCompanies();
  const { preferences, loading: preferencesLoading, savePreferences } = useGridPreferences('companies');

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleSubmit = async (data: Partial<Company>) => {
    try {
      if (currentCompany?.id) {
        await updateCompany(currentCompany.id, data);
      } else {
        await createCompany(data);
      }
      setIsModalOpen(false);
      setCurrentCompany(null);
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleDelete = async (company: Company) => {
    if (!window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      return;
    }

    try {
      await deleteCompany(company);
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  if (isLoading || preferencesLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <LoadingState container className="h-32" />
      </div>
    );
  }

  const modalFooter = (
    <div className="flex justify-end space-x-3">
      <Button
        onClick={() => {
          setIsModalOpen(false);
          setCurrentCompany(null);
        }}
        variant="ghost"
        size="lg"
        type="button"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        form="company-form"
        size="lg"
        loadingKey={currentCompany?.id ? `edit-company-${currentCompany.id}` : 'new-company'}
      >
        Salvar
      </Button>
    </div>
  );

  return (
    <div>
      <PageHeader title="Empresas">
        <Button
          onClick={() => {
            setCurrentCompany(null);
            setIsModalOpen(true);
          }}
          size="lg"
          loadingKey="new-company"
        >
          Nova Empresa
        </Button>
      </PageHeader>

      <div className="mt-8">
        <CompanyList
          companies={companies}
          preferences={preferences}
          onPreferencesChange={savePreferences}
          onEdit={(company) => {
            setCurrentCompany(company);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentCompany(null);
        }}
        title={currentCompany ? 'Editar Empresa' : 'Nova Empresa'}
        footer={modalFooter}
      >
        <CompanyForm
          company={currentCompany || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setCurrentCompany(null);
          }}
          isEditing={!!currentCompany}
        />
      </Modal>
    </div>
  );
}

export default Companies;