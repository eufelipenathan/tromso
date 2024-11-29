import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Deal, Pipeline } from '@/types/pipeline';
import { Company, Contact } from '@/types';
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
} from '@dnd-kit/core';
import { useLastSelectedPipeline } from '@/hooks/useLastSelectedPipeline';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import KanbanBoard from '@/components/pipeline/KanbanBoard';
import DealForm from '@/components/pipeline/DealForm';
import PipelineSelect from '@/components/pipeline/PipelineSelect';
import LoadingState from '@/components/LoadingState';
import KanbanMinimap from '@/components/pipeline/KanbanMinimap';
import * as Icons from 'lucide-react';

function Deals() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [scrollInfo, setScrollInfo] = useState({
    scrollLeft: 0,
    scrollWidth: 0,
    clientWidth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const boardRef = useRef<HTMLDivElement>(null);
  const { lastSelectedId, setLastSelected } = useLastSelectedPipeline();

  // Configure DnD sensors
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
    preventDefault: false,
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
    preventDefault: false,
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle URL pipeline parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pipelineId = params.get('pipeline');
    
    if (pipelineId && pipelines.length > 0) {
      const pipeline = pipelines.find(p => p.id === pipelineId);
      if (pipeline) {
        setSelectedPipeline(pipeline);
        setLastSelected(pipeline.id!);
        fetchDeals(pipeline);
      }
    }
  }, [window.location.search, pipelines]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [pipelinesData, companiesData, contactsData] = await Promise.all([
        fetchPipelines(),
        fetchCompanies(),
        fetchContacts()
      ]);

      if (pipelinesData.length > 0) {
        const sortedPipelines = pipelinesData.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        const initialPipeline = lastSelectedId 
          ? sortedPipelines.find(p => p.id === lastSelectedId) || sortedPipelines[0]
          : sortedPipelines[0];

        await fetchDeals(initialPipeline);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPipelines = async () => {
    const querySnapshot = await getDocs(collection(db, 'pipelines'));
    const pipelinesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Pipeline[];

    const sortedPipelines = pipelinesData.sort((a, b) => (a.order || 0) - (b.order || 0));
    setPipelines(sortedPipelines);

    if (sortedPipelines.length > 0) {
      const initialPipeline = lastSelectedId 
        ? sortedPipelines.find(p => p.id === lastSelectedId) || sortedPipelines[0]
        : sortedPipelines[0];

      setSelectedPipeline(initialPipeline);
    }

    return sortedPipelines;
  };

  const fetchDeals = async (pipeline: Pipeline) => {
    if (!pipeline) return;

    const querySnapshot = await getDocs(collection(db, 'deals'));
    const dealsData = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];
    setDeals(dealsData.filter(deal => deal.pipelineId === pipeline.id));
  };

  const fetchCompanies = async () => {
    const querySnapshot = await getDocs(collection(db, 'companies'));
    const companiesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Company[];
    setCompanies(companiesData);
  };

  const fetchContacts = async () => {
    const querySnapshot = await getDocs(collection(db, 'contacts'));
    const contactsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Contact[];
    setContacts(contactsData);
  };

  const handlePipelineChange = async (pipelineId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (!pipeline) return;

    setSelectedPipeline(pipeline);
    setLastSelected(pipeline.id!);
    await fetchDeals(pipeline);
  };

  const handleCreateDeal = async (deal: Partial<Deal>) => {
    if (!selectedPipeline) return;

    try {
      const newDeal = {
        ...deal,
        pipelineId: selectedPipeline.id,
        status: 'open',
        createdAt: new Date()
      };
      const docRef = await addDoc(collection(db, 'deals'), newDeal);
      setDeals(prev => [...prev, { ...newDeal, id: docRef.id } as Deal]);
      setIsDealModalOpen(false);
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  };

  const handleCompanyCreated = async (companyId: string, company: Company) => {
    setCompanies(prev => [...prev, company]);
    return company;
  };

  const handleContactCreated = async (contactId: string, contact: Contact) => {
    setContacts(prev => [...prev, contact]);
    return contact;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const deal = deals.find(d => d.id === active.id);
    if (deal) {
      setActiveDeal(deal);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);
    
    if (!over || active.id === over.id) {
      return;
    }

    const deal = deals.find(d => d.id === active.id);
    if (!deal) return;

    const newStageId = over.id as string;
    if (deal.stageId === newStageId) return;

    setDeals(prev => prev.map(d => {
      if (d.id === deal.id) {
        return { ...d, stageId: newStageId };
      }
      return d;
    }));

    try {
      await updateDoc(doc(db, 'deals', deal.id!), {
        stageId: newStageId,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating deal stage:', error);
    }
  };

  const handleScroll = (scrollLeft: number) => {
    if (boardRef.current) {
      boardRef.current.scrollLeft = scrollLeft;
    }
  };

  const renderDealCard = (deal: Deal) => {
    const company = companies.find(c => c.id === deal.companyId);
    const contact = contacts.find(c => c.id === deal.contactId);

    return (
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <h3 className="font-medium text-gray-900">{deal.title}</h3>
        
        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-500">
            {company?.name}
            {contact && ` • ${contact.name}`}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(deal.value)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <LoadingState container className="h-32" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={
        <div className="flex items-center space-x-3">
          {(() => {
            const Icon = selectedPipeline?.icon 
              ? Icons[selectedPipeline.icon as keyof typeof Icons]
              : Icons.Banknote;
            
            return (
              <>
                <Icon className="h-8 w-8 text-gray-600" />
                <span>{selectedPipeline?.name || 'Negócios'}</span>
              </>
            );
          })()}
        </div>
      }>
        <div className="flex items-center space-x-4">
          <PipelineSelect
            value={selectedPipeline?.id || ''}
            onChange={handlePipelineChange}
            pipelines={pipelines}
          />

          <Button
            onClick={() => setIsDealModalOpen(true)}
            size="lg"
            loadingKey="new-deal"
          >
            Novo Negócio
          </Button>
        </div>
      </PageHeader>

      {selectedPipeline && (
        <div className="mt-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <KanbanBoard
              ref={boardRef}
              stages={selectedPipeline.stages}
              deals={deals}
              renderCard={renderDealCard}
              onScroll={setScrollInfo}
            />

            <DragOverlay dropAnimation={null}>
              {activeDeal && (
                <div className="rounded-lg shadow-lg ring-2 ring-blue-500 bg-white">
                  {renderDealCard(activeDeal)}
                </div>
              )}
            </DragOverlay>

            <KanbanMinimap
              stages={selectedPipeline.stages}
              scrollInfo={scrollInfo}
              onScroll={handleScroll}
            />
          </DndContext>
        </div>
      )}

      <DealForm
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        onSubmit={handleCreateDeal}
        companies={companies}
        contacts={contacts}
        pipeline={selectedPipeline}
        onCompanyCreated={handleCompanyCreated}
        onContactCreated={handleContactCreated}
      />
    </div>
  );
}

export default Deals;