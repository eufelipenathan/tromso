import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LossReason } from '@/types/pipeline';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Form from '@/components/forms/Form';
import ValidationInput from '@/components/forms/ValidationInput';
import SettingsSidebar from '@/components/pipeline/SettingsSidebar';
import SortableLossReason from '@/components/pipeline/SortableLossReason';
import LoadingState from '@/components/LoadingState';

function LossReasons() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReason, setCurrentReason] = useState<Partial<LossReason>>({});
  const [originalReason, setOriginalReason] = useState<Partial<LossReason>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [reasons, setReasons] = useState<LossReason[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { execute } = useOptimisticUpdate<LossReason[]>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchReasons();
  }, []);

  const fetchReasons = async () => {
    try {
      setIsLoading(true);
      const q = query(
        collection(db, 'lossReasons'),
        where('deletedAt', '==', null)
      );
      const snapshot = await getDocs(q);
      const reasonsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        deletedAt: doc.data().deletedAt?.toDate(),
      })) as LossReason[];

      setReasons(reasonsData.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error fetching reasons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const name = currentReason.name?.trim();

    if (!name) {
      errors.name = 'Nome é obrigatório';
      setFormErrors(errors);
      return false;
    }

    // Check for duplicate names, ignoring case and current reason being edited
    const isDuplicate = reasons.some(
      (reason) =>
        reason.name.toLowerCase() === name.toLowerCase() &&
        (!isEditing || reason.id !== currentReason.id)
    );

    if (isDuplicate) {
      errors.name = 'Já existe um motivo com este nome';
      setFormErrors(errors);
      return false;
    }

    setFormErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Close modal immediately for better UX
    setIsModalOpen(false);

    const previousReasons = [...reasons];
    const reasonData = {
      name: currentReason.name!.trim(),
      description: currentReason.description?.trim() || '',
      order: reasons.length,
      isDeleted: false,
      deletedAt: null,
    };

    if (isEditing && currentReason.id) {
      // Optimistic update
      const updatedReasons = reasons.map((reason) =>
        reason.id === currentReason.id
          ? {
              ...reason,
              ...reasonData,
              updatedAt: new Date(),
            }
          : reason
      );
      setReasons(updatedReasons);

      try {
        await execute(
          async () => {
            const batch = writeBatch(db);
            const reasonRef = doc(db, 'lossReasons', currentReason.id!);
            batch.update(reasonRef, {
              ...reasonData,
              updatedAt: serverTimestamp(),
            });
            await batch.commit();
          },
          updatedReasons,
          previousReasons,
          { loadingKey: `edit-reason-${currentReason.id}` }
        );
      } catch (error) {
        console.error('Error updating reason:', error);
      }
    } else {
      // Optimistic create
      const tempId = Math.random().toString(36).substr(2, 9);
      const now = new Date();
      const newReason = {
        ...reasonData,
        id: tempId,
        createdAt: now,
        updatedAt: now,
      } as LossReason;

      const updatedReasons = [...reasons, newReason];
      setReasons(updatedReasons);

      try {
        await execute(
          async () => {
            const docRef = await addDoc(collection(db, 'lossReasons'), {
              ...reasonData,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            // Update local state with real ID
            setReasons((prev) =>
              prev.map((r) => (r.id === tempId ? { ...r, id: docRef.id } : r))
            );
          },
          updatedReasons,
          previousReasons,
          { loadingKey: 'new-reason' }
        );
      } catch (error) {
        console.error('Error creating reason:', error);
      }
    }

    setCurrentReason({});
    setFormErrors({});
  };

  const handleDelete = async (reason: LossReason) => {
    if (!window.confirm('Tem certeza que deseja excluir este motivo?')) {
      return;
    }

    const previousReasons = [...reasons];
    const updatedReasons = reasons.filter((r) => r.id !== reason.id);
    setReasons(updatedReasons);

    try {
      await execute(
        async () => {
          await updateDoc(doc(db, 'lossReasons', reason.id!), {
            deletedAt: serverTimestamp(),
            isDeleted: true,
            updatedAt: serverTimestamp(),
          });
        },
        updatedReasons,
        previousReasons,
        { loadingKey: `delete-reason-${reason.id}` }
      );
    } catch (error) {
      console.error('Error deleting reason:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = reasons.findIndex((r) => r.id === active.id);
    const newIndex = reasons.findIndex((r) => r.id === over.id);

    const newReasons = arrayMove(reasons, oldIndex, newIndex).map(
      (reason, index) => ({ ...reason, order: index })
    );

    const previousReasons = [...reasons];
    setReasons(newReasons);

    try {
      await execute(
        async () => {
          const batch = writeBatch(db);
          newReasons.forEach((reason, index) => {
            const reasonRef = doc(db, 'lossReasons', reason.id!);
            batch.update(reasonRef, {
              order: index,
              updatedAt: serverTimestamp(),
            });
          });
          await batch.commit();
        },
        newReasons,
        previousReasons,
        { loadingKey: 'reorder-reasons' }
      );
    } catch (error) {
      console.error('Error reordering reasons:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full">
        <SettingsSidebar />
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <LoadingState container className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <SettingsSidebar />

      <div className="flex-1">
        <div className="px-6">
          <PageHeader title="Motivos de perda">
            <Button
              onClick={() => {
                setIsEditing(false);
                setCurrentReason({});
                setOriginalReason({});
                setFormErrors({});
                setIsModalOpen(true);
              }}
              size="lg"
              loadingKey="new-reason"
            >
              Novo motivo
            </Button>
          </PageHeader>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border divide-y">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={reasons.map((reason) => reason.id!)}
                strategy={verticalListSortingStrategy}
              >
                {reasons.map((reason) => (
                  <SortableLossReason
                    key={reason.id}
                    reason={reason}
                    onEdit={() => {
                      setCurrentReason(reason);
                      setOriginalReason(reason);
                      setIsEditing(true);
                      setFormErrors({});
                      setIsModalOpen(true);
                    }}
                    onDelete={() => handleDelete(reason)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {reasons.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">
                  Nenhum motivo cadastrado. Clique em "Novo Motivo" para
                  começar.
                </p>
              </div>
            )}
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormErrors({});
          }}
          title={isEditing ? 'Editar motivo' : 'Novo motivo'}
        >
          <Form onSubmit={handleSubmit} className="space-y-4">
            <ValidationInput
              label="Nome"
              value={currentReason.name || ''}
              onChange={(e) =>
                setCurrentReason({ ...currentReason, name: e.target.value })
              }
              error={formErrors.name}
              required
            />

            <ValidationInput
              label="Descrição"
              value={currentReason.description || ''}
              onChange={(e) =>
                setCurrentReason({
                  ...currentReason,
                  description: e.target.value,
                })
              }
            />

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormErrors({});
                }}
                variant="ghost"
                size="lg"
                type="button"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="lg"
                loadingKey={
                  isEditing ? `edit-reason-${currentReason.id}` : 'new-reason'
                }
              >
                Salvar
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

export default LossReasons;
