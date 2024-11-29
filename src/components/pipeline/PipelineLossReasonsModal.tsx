import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Pipeline, LossReason, PipelineLossReason } from '@/types/pipeline';
import { useUI } from '@/hooks/useUI';
import Modal from '../Modal';
import Button from '../Button';
import SortableLossReason from './SortableLossReason';
import { Plus } from 'lucide-react';

interface PipelineLossReasonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipeline: Pipeline;
  onSave: (reasons: PipelineLossReason[]) => Promise<void>;
}

const PipelineLossReasonsModal: React.FC<PipelineLossReasonsModalProps> = ({
  isOpen,
  onClose,
  pipeline,
  onSave
}) => {
  const [allReasons, setAllReasons] = useState<LossReason[]>([]);
  const [selectedReasons, setSelectedReasons] = useState<PipelineLossReason[]>([]);
  const [availableReasons, setAvailableReasons] = useState<LossReason[]>([]);
  const { startLoading, stopLoading } = useUI();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (isOpen) {
      fetchReasons();
    }
  }, [isOpen]);

  useEffect(() => {
    if (pipeline) {
      setSelectedReasons(pipeline.lossReasons || []);
    }
  }, [pipeline]);

  useEffect(() => {
    // Update available reasons list
    const selectedIds = new Set(selectedReasons.map(r => r.reasonId));
    setAvailableReasons(
      allReasons
        // Filter out soft-deleted reasons and already selected ones
        .filter(r => !r.deletedAt && !selectedIds.has(r.id!))
        // Sort by order
        .sort((a, b) => a.order - b.order)
    );
  }, [allReasons, selectedReasons]);

  const fetchReasons = async () => {
    try {
      startLoading('fetch-all-reasons');
      
      // Query only non-deleted reasons
      const q = query(
        collection(db, 'lossReasons'),
        where('deletedAt', '==', null)
      );
      
      const querySnapshot = await getDocs(q);
      const reasonsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamp to Date
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        deletedAt: doc.data().deletedAt?.toDate()
      })) as LossReason[];

      setAllReasons(reasonsData.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error fetching loss reasons:', error);
    } finally {
      stopLoading('fetch-all-reasons');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = selectedReasons.findIndex(r => r.reasonId === active.id);
    const newIndex = selectedReasons.findIndex(r => r.reasonId === over.id);
    
    const newReasons = arrayMove(selectedReasons, oldIndex, newIndex)
      .map((reason, index) => ({ ...reason, order: index }));

    setSelectedReasons(newReasons);
  };

  const handleAddReason = (reasonId: string) => {
    setSelectedReasons(prev => [
      ...prev,
      {
        reasonId,
        order: prev.length
      }
    ]);
  };

  const handleRemoveReason = (reasonId: string) => {
    setSelectedReasons(prev => 
      prev
        .filter(r => r.reasonId !== reasonId)
        .map((r, index) => ({ ...r, order: index }))
    );
  };

  const handleSave = async () => {
    await onSave(selectedReasons);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Motivos de Perda"
    >
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Motivos Disponíveis
          </h4>
          
          <div className="space-y-2">
            {availableReasons.map(reason => (
              <div
                key={reason.id}
                className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between"
              >
                <div>
                  <h5 className="text-sm font-medium text-gray-900">
                    {reason.name}
                  </h5>
                  {reason.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {reason.description}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => handleAddReason(reason.id!)}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600"
                  icon={<Plus className="h-4 w-4" />}
                >
                  Adicionar
                </Button>
              </div>
            ))}

            {availableReasons.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Não há mais motivos disponíveis para adicionar.
              </p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Motivos Selecionados
          </h4>

          <div className="bg-gray-50 rounded-lg">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedReasons.map(r => r.reasonId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="divide-y divide-gray-200">
                  {selectedReasons.map(({ reasonId }) => {
                    const reason = allReasons.find(r => r.id === reasonId);
                    if (!reason) return null;

                    return (
                      <SortableLossReason
                        key={reason.id}
                        reason={reason}
                        showActions={false}
                        onRemove={() => handleRemoveReason(reason.id!)}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>

            {selectedReasons.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">
                  Nenhum motivo selecionado. Adicione motivos da lista acima.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            onClick={onClose}
            variant="ghost"
            size="lg"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            size="lg"
            loadingKey="save-pipeline-reasons"
          >
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PipelineLossReasonsModal;