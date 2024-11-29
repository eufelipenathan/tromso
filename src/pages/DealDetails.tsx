import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Deal, Pipeline } from '@/types/pipeline';
import { Company, Contact } from '@/types';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Button from '@/components/Button';
import DealStages from '@/components/pipeline/DealStages';
import DealTabs from '@/components/pipeline/DealTabs';
import DealTimeline from '@/components/pipeline/DealTimeline';
import DealInteractionForm from '@/components/pipeline/DealInteractionForm';
import DealSidebar from '@/components/pipeline/DealSidebar';
import LoadingState from '@/components/LoadingState';
import BreadcrumbButton from '@/components/pipeline/BreadcrumbButton';
import { SmartDropdown, SmartDropdownItem, SmartDropdownSeparator } from '@/components/ui/SmartDropdown';
import * as Icons from 'lucide-react';

function DealDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDeal(id);
    }
  }, [id]);

  const loadDeal = async (dealId: string) => {
    try {
      setIsLoading(true);
      const dealDoc = await getDoc(doc(db, 'deals', dealId));
      if (!dealDoc.exists()) return;
      
      const dealData = { id: dealDoc.id, ...dealDoc.data() } as Deal;
      setDeal(dealData);

      const pipelineDoc = await getDoc(doc(db, 'pipelines', dealData.pipelineId));
      if (pipelineDoc.exists()) {
        setPipeline({ id: pipelineDoc.id, ...pipelineDoc.data() } as Pipeline);
      }

      const companyDoc = await getDoc(doc(db, 'companies', dealData.companyId));
      if (companyDoc.exists()) {
        setCompany({ id: companyDoc.id, ...companyDoc.data() } as Company);
      }

      if (dealData.contactId) {
        const contactDoc = await getDoc(doc(db, 'contacts', dealData.contactId));
        if (contactDoc.exists()) {
          setContact({ id: contactDoc.id, ...contactDoc.data() } as Contact);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deal?.id) return;
    
    if (window.confirm('Tem certeza que deseja excluir este negócio?')) {
      try {
        await deleteDoc(doc(db, 'deals', deal.id));
        navigate('/deals');
      } catch (error) {
        console.error('Error deleting deal:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <LoadingState container className="h-32" />
      </div>
    );
  }

  if (!deal || !pipeline) return null;

  const tabs = [
    { id: 'timeline', label: 'Linha do tempo' },
    { id: 'presentations', label: 'Apresentações' },
    { id: 'proposals', label: 'Propostas', count: 2 },
    { id: 'sales', label: 'Vendas' },
    { id: 'documents', label: 'Documentos' },
    { id: 'related', label: 'Negócios derivados' },
    { id: 'attachments', label: 'Anexos' }
  ];

  return (
    <div className="flex h-full">
      <div className="flex-1 min-w-0">
        <div className="bg-white border-b border-t border-l">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold text-gray-900 mb-2 truncate">{deal.title}</h1>
                
                <div className="flex flex-wrap items-center gap-2">
                  <BreadcrumbButton
                    to={`/deals?pipeline=${pipeline.id}`}
                    icon={pipeline.icon as keyof typeof Icons}
                  >
                    {pipeline.name}
                  </BreadcrumbButton>

                  <BreadcrumbButton icon="CircleDollarSign">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(deal.value)}
                  </BreadcrumbButton>

                  {company && (
                    <BreadcrumbButton
                      to={`/companies/${company.id}`}
                      icon="Building2"
                    >
                      {company.name}
                    </BreadcrumbButton>
                  )}

                  {contact && (
                    <BreadcrumbButton
                      to={`/contacts/${contact.id}`}
                      icon="User"
                    >
                      {contact.name}
                    </BreadcrumbButton>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0">
                <Button
                  variant="primary"
                  onClick={() => {
                    // Handle win deal
                  }}
                >
                  Ganhar
                </Button>

                <Button
                  variant="danger"
                  onClick={() => {
                    // Handle lose deal
                  }}
                >
                  Perder
                </Button>

                <SmartDropdown
                  trigger={
                    <Button variant="secondary">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  }
                  placement="bottom-end"
                  className="bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1 min-w-[180px]"
                >
                  <SmartDropdownItem
                    onClick={() => navigate(`/deals/${deal.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Editar</span>
                  </SmartDropdownItem>
                  
                  <SmartDropdownSeparator />
                  
                  <SmartDropdownItem
                    variant="danger"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir</span>
                  </SmartDropdownItem>
                </SmartDropdown>
              </div>
            </div>

            <div className="mt-6">
              <DealStages
                stages={pipeline.stages}
                currentStage={deal.stageId}
                dealId={deal.id!}
              />
            </div>
          </div>

          <DealTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <div className="p-8 space-y-6">
          <DealInteractionForm
            onSubmit={async (data) => {
              // Handle interaction submit
            }}
          />

          <DealTimeline
            events={[
              {
                id: '1',
                type: 'interaction',
                title: 'Retomar contato com o Gustavo.',
                user: {
                  name: 'Emanuela Apolinário',
                  avatar: 'EA'
                },
                date: new Date(),
                status: 'open'
              }
            ]}
          />
        </div>
      </div>

      <div className="w-80 border-l bg-white">
        <DealSidebar
          deal={deal}
          company={company}
          contact={contact}
        />
      </div>
    </div>
  );
}

export default DealDetails;