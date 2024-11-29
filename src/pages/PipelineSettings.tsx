import React, { useState, useEffect } from 'react';
import { Pipeline, PipelineStage } from '@/types/pipeline';
import { usePipelines } from '@/hooks/usePipelines';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Form from '@/components/forms/Form';
import ValidationInput from '@/components/forms/ValidationInput';
import SettingsSidebar from '@/components/pipeline/SettingsSidebar';
import PipelineList from '@/components/pipeline/PipelineList';
import PipelineLossReasonsModal from '@/components/pipeline/PipelineLossReasonsModal';
import IconPicker from '@/components/pipeline/IconPicker';
import LoadingState from '@/components/LoadingState';
import { useUI } from '@/hooks/useUI';

function PipelineSettings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isLossReasonsModalOpen, setIsLossReasonsModalOpen] = useState(false);
  const [currentPipeline, setCurrentPipeline] = useState<Partial<Pipeline>>({});
  const [currentStage, setCurrentStage] = useState<Partial<PipelineStage>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const { startLoading, stopLoading } = useUI();

  const {
    pipelines,
    loading,
    loadPipelines,
    createPipeline,
    updatePipeline,
    deletePipeline,
    reorderPipelines,
    createStage,
    updateStage,
    deleteStage,
    reorderStages,
  } = usePipelines();

  useEffect(() => {
    loadPipelines();
  }, [loadPipelines]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!currentPipeline.name?.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStageForm = () => {
    const errors: Record<string, string> = {};
    const stageName = currentStage.name?.trim();

    if (!stageName) {
      errors.name = 'Nome é obrigatório';
      setFormErrors(errors);
      return false;
    }

    // Check for duplicate stage names
    const pipeline = pipelines.find((p) => p.id === currentStage.pipelineId);
    if (pipeline) {
      const normalizedName = stageName.toLowerCase();
      const isDuplicate = pipeline.stages.some(
        (stage) =>
          stage.id !== currentStage.id &&
          stage.name.trim().toLowerCase() === normalizedName
      );

      if (isDuplicate) {
        errors.name = 'Já existe uma etapa com este nome';
        setFormErrors(errors);
        return false;
      }
    }

    setFormErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Close modal immediately
    setIsModalOpen(false);

    try {
      if (isEditing && currentPipeline.id) {
        await updatePipeline(currentPipeline.id, currentPipeline);
      } else {
        await createPipeline(currentPipeline);
      }

      setCurrentPipeline({});
      setFormErrors({});
    } catch (error) {
      if (error instanceof Error) {
        setFormErrors({ name: error.message });
        // Reopen modal if there was an error
        setIsModalOpen(true);
      }
    }
  };

  const handleStageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStageForm()) {
      return;
    }

    // Close modal immediately
    setIsStageModalOpen(false);

    try {
      if (isEditing && currentStage.id) {
        await updateStage(currentStage.id, currentStage);
      } else {
        await createStage(currentStage.pipelineId!, {
          name: currentStage.name!.trim(),
        });
      }

      setCurrentStage({});
      setFormErrors({});
    } catch (error) {
      if (error instanceof Error) {
        setFormErrors({ name: error.message });
        // Reopen modal if there was an error
        setIsStageModalOpen(true);
      }
    }
  };

  const handleDeleteStage = async (stage: PipelineStage) => {
    if (!window.confirm('Tem certeza que deseja excluir esta etapa?')) {
      return;
    }

    try {
      await deleteStage(stage.id!);
    } catch (error) {
      console.error('Error deleting stage:', error);
    }
  };

  if (loading) {
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
          <PageHeader title="Pipelines e etapas">
            <Button
              onClick={() => {
                setIsEditing(false);
                setCurrentPipeline({});
                setFormErrors({});
                setIsModalOpen(true);
              }}
              size="lg"
              loadingKey="new-pipeline"
            >
              Novo funil
            </Button>
          </PageHeader>
        </div>

        <div className="p-6">
          <PipelineList
            pipelines={pipelines}
            onEditPipeline={(pipeline) => {
              setCurrentPipeline(pipeline);
              setIsEditing(true);
              setFormErrors({});
              setIsModalOpen(true);
            }}
            onDeletePipeline={deletePipeline}
            onEditStage={(stage) => {
              setCurrentStage(stage);
              setIsEditing(true);
              setFormErrors({});
              setIsStageModalOpen(true);
            }}
            onDeleteStage={handleDeleteStage}
            onReorderStages={reorderStages}
            onAddStage={(pipeline) => {
              setCurrentStage({ pipelineId: pipeline.id });
              setIsEditing(false);
              setFormErrors({});
              setIsStageModalOpen(true);
            }}
            onManageLossReasons={(pipeline) => {
              setCurrentPipeline(pipeline);
              setIsLossReasonsModalOpen(true);
            }}
            onReorderPipelines={reorderPipelines}
          />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormErrors({});
          }}
          title={isEditing ? 'Editar funil' : 'Novo funil'}
        >
          <Form
            onSubmit={handleSubmit}
            className="space-y-4"
            loadingKey={
              isEditing ? `edit-pipeline-${currentPipeline.id}` : 'new-pipeline'
            }
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <ValidationInput
                  label="Nome"
                  value={currentPipeline.name || ''}
                  onChange={(e) =>
                    setCurrentPipeline({
                      ...currentPipeline,
                      name: e.target.value,
                    })
                  }
                  error={formErrors.name}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ícone
                </label>
                <IconPicker
                  value={currentPipeline.icon || 'Banknote'}
                  onChange={(icon) =>
                    setCurrentPipeline({ ...currentPipeline, icon })
                  }
                />
              </div>

              <div className="col-span-3">
                <ValidationInput
                  label="Descrição"
                  value={currentPipeline.description || ''}
                  onChange={(e) =>
                    setCurrentPipeline({
                      ...currentPipeline,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>

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
                  isEditing
                    ? `edit-pipeline-${currentPipeline.id}`
                    : 'new-pipeline'
                }
              >
                Salvar
              </Button>
            </div>
          </Form>
        </Modal>

        <Modal
          isOpen={isStageModalOpen}
          onClose={() => {
            setIsStageModalOpen(false);
            setFormErrors({});
          }}
          title={isEditing ? 'Editar etapa' : 'Nova etapa'}
        >
          <Form
            onSubmit={handleStageSubmit}
            className="space-y-4"
            loadingKey={
              isEditing ? `edit-stage-${currentStage.id}` : 'new-stage'
            }
          >
            <ValidationInput
              label="Nome"
              value={currentStage.name || ''}
              onChange={(e) =>
                setCurrentStage({ ...currentStage, name: e.target.value })
              }
              error={formErrors.name}
              required
            />

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                onClick={() => {
                  setIsStageModalOpen(false);
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
                  isEditing ? `edit-stage-${currentStage.id}` : 'new-stage'
                }
              >
                Salvar
              </Button>
            </div>
          </Form>
        </Modal>

        <PipelineLossReasonsModal
          isOpen={isLossReasonsModalOpen}
          onClose={() => setIsLossReasonsModalOpen(false)}
          pipeline={currentPipeline as Pipeline}
          onSave={async (selectedReasons) => {
            // Close modal immediately
            setIsLossReasonsModalOpen(false);

            try {
              if (!currentPipeline.id) return;
              await updatePipeline(currentPipeline.id, {
                lossReasons: selectedReasons,
              });
            } catch (error) {
              console.error('Error updating loss reasons:', error);
              // Reopen modal if there was an error
              setIsLossReasonsModalOpen(true);
            }
          }}
        />
      </div>
    </div>
  );
}

export default PipelineSettings;
