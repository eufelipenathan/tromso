import React, { useState, useEffect } from 'react';
import { Deal, Pipeline } from '@/types/pipeline';
import { Company, Contact } from '@/types';
import { dealConfig } from '@/lib/entity-management/configs/dealConfig';
import Modal from '../Modal';
import Form from '../forms/Form';
import Button from '../Button';
import ValidationInput from '../forms/ValidationInput';
import CompanySelect from '../forms/CompanySelect';
import ContactSelect from '../forms/ContactSelect';
import CompanyForm from '../forms/CompanyForm';
import ContactForm from '../forms/ContactForm';

interface DealFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deal: Partial<Deal>) => Promise<void>;
  companies: Company[];
  contacts: Contact[];
  pipeline: Pipeline | null;
  onCompanyCreated: (companyId: string, company: Company) => Promise<Company>;
  onContactCreated: (contactId: string, contact: Contact) => Promise<Contact>;
}

const DealForm: React.FC<DealFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  companies,
  contacts,
  pipeline,
  onCompanyCreated,
  onContactCreated
}) => {
  const [currentDeal, setCurrentDeal] = useState<Partial<Deal>>({
    stageId: pipeline?.stages[0]?.id
  });
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setCurrentDeal({ stageId: pipeline?.stages[0]?.id });
      setFormErrors({});
    }
  }, [isOpen, pipeline]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!currentDeal.title?.trim()) {
      errors.title = 'Título é obrigatório';
    }

    if (!currentDeal.companyId) {
      errors.companyId = 'Empresa é obrigatória';
    }

    if (!currentDeal.value || currentDeal.value <= 0) {
      errors.value = 'Valor é obrigatório e deve ser maior que zero';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(currentDeal);
    setCurrentDeal({ stageId: pipeline?.stages[0]?.id });
    setFormErrors({});
  };

  const handleCompanySave = async (companyId: string, company: Company) => {
    console.log('[DealForm] Company saved:', { companyId, company });
    
    try {
      const updatedCompany = await onCompanyCreated(companyId, company);
      console.log('[DealForm] Company updated:', updatedCompany);
      
      setCurrentDeal(prev => ({
        ...prev,
        companyId: updatedCompany.id,
        contactId: undefined
      }));
      
      setIsCompanyModalOpen(false);
      setNewCompanyName('');
    } catch (error) {
      console.error('[DealForm] Error handling company save:', error);
    }
  };

  const handleContactSave = async (contactId: string, contact: Contact) => {
    console.log('[DealForm] Contact saved:', { contactId, contact });
    
    try {
      const updatedContact = await onContactCreated(contactId, contact);
      console.log('[DealForm] Contact updated:', updatedContact);
      
      setCurrentDeal(prev => ({
        ...prev,
        contactId: updatedContact.id
      }));
      
      setIsContactModalOpen(false);
      setNewContactName('');
    } catch (error) {
      console.error('[DealForm] Error handling contact save:', error);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Novo Negócio"
      >
        <Form 
          onSubmit={handleSubmit}
          className="space-y-4"
          loadingKey="save-deal"
        >
          <ValidationInput
            label="Título"
            value={currentDeal.title || ''}
            onChange={(e) => setCurrentDeal({ ...currentDeal, title: e.target.value })}
            error={formErrors.title}
            required
          />

          <CompanySelect
            value={currentDeal.companyId || ''}
            onChange={(companyId) => {
              console.log('[DealForm] Company selected:', companyId);
              setCurrentDeal({ 
                ...currentDeal, 
                companyId,
                contactId: undefined
              });
            }}
            companies={companies}
            onCreateClick={(name) => {
              console.log('[DealForm] Create company clicked:', name);
              setNewCompanyName(name);
              setIsCompanyModalOpen(true);
            }}
            hideCreateButton
          />

          <ContactSelect
            value={currentDeal.contactId || ''}
            onChange={(contactId) => {
              console.log('[DealForm] Contact selected:', contactId);
              setCurrentDeal({ ...currentDeal, contactId });
            }}
            contacts={contacts}
            companyId={currentDeal.companyId}
            onCreateClick={(name) => {
              console.log('[DealForm] Create contact clicked:', name);
              setNewContactName(name);
              setIsContactModalOpen(true);
            }}
            disabled={!currentDeal.companyId}
            disabledMessage="Selecione uma empresa primeiro"
            hideCreateButton
          />

          <ValidationInput
            type="number"
            label="Valor"
            value={currentDeal.value || ''}
            onChange={(e) => {
              console.log('[DealForm] Value changed:', e.target.value);
              setCurrentDeal({ 
                ...currentDeal, 
                value: parseFloat(e.target.value) 
              });
            }}
            error={formErrors.value}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Etapa
            </label>
            <select
              value={currentDeal.stageId || ''}
              onChange={(e) => {
                console.log('[DealForm] Stage changed:', e.target.value);
                setCurrentDeal({ ...currentDeal, stageId: e.target.value });
              }}
              className="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
              required
            >
              {pipeline?.stages.map(stage => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              onClick={onClose}
              variant="ghost"
              size="lg"
              type="button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="lg"
              loadingKey="save-deal"
            >
              Salvar
            </Button>
          </div>
        </Form>
      </Modal>

      <CompanyForm
        isOpen={isCompanyModalOpen}
        onClose={() => {
          console.log('[DealForm] Company modal closed');
          setIsCompanyModalOpen(false);
          setNewCompanyName('');
        }}
        onSave={handleCompanySave}
        initialName={newCompanyName}
      />

      <ContactForm
        isOpen={isContactModalOpen}
        onClose={() => {
          console.log('[DealForm] Contact modal closed');
          setIsContactModalOpen(false);
          setNewContactName('');
        }}
        onSave={handleContactSave}
        initialName={newContactName}
        companyId={currentDeal.companyId}
      />
    </>
  );
};

export default DealForm;