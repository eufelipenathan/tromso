import React, { useState, useEffect } from 'react';
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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CustomField, CustomSection } from '@/types';
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
import Modal from '@/components/Modal';
import PageHeader from '@/components/PageHeader';
import ValidationInput from '@/components/forms/ValidationInput';
import Button from '@/components/Button';
import Form from '@/components/forms/Form';
import SortableSection from '@/components/sortable/SortableSection';
import { useUI } from '@/hooks/useUI';
import SettingsSidebar from '@/components/pipeline/SettingsSidebar';
import LoadingState from '@/components/LoadingState';

function CustomFields() {
  const [selectedEntity, setSelectedEntity] = useState<'company' | 'contact'>(
    'company'
  );
  const [sections, setSections] = useState<CustomSection[]>([]);
  const [fields, setFields] = useState<CustomField[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'section' | 'field'>('section');
  const [currentSection, setCurrentSection] = useState<Partial<CustomSection>>(
    {}
  );
  const [currentField, setCurrentField] = useState<Partial<CustomField>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { startLoading, stopLoading } = useUI();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSectionsAndFields();
  }, [selectedEntity]);

  const fetchSectionsAndFields = async () => {
    try {
      setIsLoading(true);

      const sectionsQuery = query(
        collection(db, 'customSections'),
        where('entity', '==', selectedEntity)
      );
      const sectionsSnapshot = await getDocs(sectionsQuery);
      const sectionsData = sectionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CustomSection[];
      setSections(sectionsData.sort((a, b) => a.order - b.order));

      const fieldsQuery = query(
        collection(db, 'customFields'),
        where('entity', '==', selectedEntity)
      );
      const fieldsSnapshot = await getDocs(fieldsQuery);
      const fieldsData = fieldsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CustomField[];
      setFields(fieldsData.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sections.findIndex((section) => section.id === active.id);
    const newIndex = sections.findIndex((section) => section.id === over.id);

    const newSections = arrayMove(sections, oldIndex, newIndex);
    setSections(newSections);

    const batch = writeBatch(db);
    newSections.forEach((section, index) => {
      const sectionRef = doc(db, 'customSections', section.id);
      batch.update(sectionRef, { order: index });
    });

    try {
      startLoading('reorder-sections');
      await batch.commit();
    } catch (error) {
      console.error('Error updating section order:', error);
    } finally {
      stopLoading('reorder-sections');
    }
  };

  const handleFieldsReorder = async (
    sectionId: string,
    newFields: CustomField[]
  ) => {
    const sectionFields = fields.filter((f) => f.sectionId === sectionId);
    const otherFields = fields.filter((f) => f.sectionId !== sectionId);

    const updatedFields = [
      ...otherFields,
      ...newFields.map((field, index) => ({ ...field, order: index })),
    ];

    setFields(updatedFields);

    const batch = writeBatch(db);
    newFields.forEach((field, index) => {
      const fieldRef = doc(db, 'customFields', field.id);
      batch.update(fieldRef, { order: index });
    });

    try {
      startLoading('reorder-fields');
      await batch.commit();
    } catch (error) {
      console.error('Error updating field order:', error);
    } finally {
      stopLoading('reorder-fields');
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (modalType === 'section') {
      if (!currentSection.name?.trim()) {
        errors.name = 'Nome é obrigatório';
      }
    } else {
      if (!currentField.name?.trim()) {
        errors.name = 'Nome é obrigatório';
      }
      if (!currentField.type) {
        errors.type = 'Tipo é obrigatório';
      }
      if (
        currentField.type === 'select' &&
        (!currentField.options || currentField.options.length === 0)
      ) {
        errors.options = 'Adicione pelo menos uma opção';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const loadingKey = isEditing
      ? `edit-${modalType}-${
          modalType === 'section' ? currentSection.id : currentField.id
        }`
      : `new-${modalType}`;

    try {
      startLoading(loadingKey);

      if (modalType === 'section') {
        const sectionData = {
          name: currentSection.name!.trim(),
          entity: selectedEntity,
          order: isEditing ? currentSection.order : sections.length,
        };

        if (isEditing && currentSection.id) {
          await updateDoc(
            doc(db, 'customSections', currentSection.id),
            sectionData
          );
        } else {
          await addDoc(collection(db, 'customSections'), sectionData);
        }
      } else {
        const fieldData = {
          name: currentField.name!.trim(),
          type: currentField.type,
          required: currentField.required || false,
          entity: selectedEntity,
          sectionId: currentField.sectionId,
          order: isEditing
            ? currentField.order
            : fields.filter((f) => f.sectionId === currentField.sectionId)
                .length,
          ...(currentField.type === 'select' && {
            options: currentField.options,
            multipleSelect: currentField.multipleSelect || false,
          }),
        };

        if (isEditing && currentField.id) {
          await updateDoc(doc(db, 'customFields', currentField.id), fieldData);
        } else {
          await addDoc(collection(db, 'customFields'), fieldData);
        }
      }

      setIsModalOpen(false);
      setCurrentSection({});
      setCurrentField({});
      setFormErrors({});
      await fetchSectionsAndFields();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      stopLoading(loadingKey);
    }
  };

  const handleDeleteSection = async (section: CustomSection) => {
    if (
      !window.confirm(
        'Tem certeza que deseja excluir esta seção e todos os seus campos?'
      )
    ) {
      return;
    }

    const loadingKey = `delete-section-${section.id}`;

    try {
      startLoading(loadingKey);

      const sectionFields = fields.filter((f) => f.sectionId === section.id);
      const batch = writeBatch(db);
      sectionFields.forEach((field) => {
        batch.delete(doc(db, 'customFields', field.id));
      });
      batch.delete(doc(db, 'customSections', section.id));
      await batch.commit();

      await fetchSectionsAndFields();
    } catch (error) {
      console.error('Error deleting section:', error);
    } finally {
      stopLoading(loadingKey);
    }
  };

  const handleDeleteField = async (field: CustomField) => {
    if (!window.confirm('Tem certeza que deseja excluir este campo?')) {
      return;
    }

    const loadingKey = `delete-field-${field.id}`;

    try {
      startLoading(loadingKey);
      await deleteDoc(doc(db, 'customFields', field.id));
      await fetchSectionsAndFields();
    } catch (error) {
      console.error('Error deleting field:', error);
    } finally {
      stopLoading(loadingKey);
    }
  };

  return (
    <div className="flex h-full">
      <SettingsSidebar
        customFieldsEntity={selectedEntity}
        onCustomFieldsEntityChange={setSelectedEntity}
      />

      <div className="flex-1">
        <div className="px-6">
          <PageHeader title="Seções e campos">
            <Button
              onClick={() => {
                setIsEditing(false);
                setModalType('section');
                setCurrentSection({});
                setFormErrors({});
                setIsModalOpen(true);
              }}
              size="lg"
              loadingKey="new-section"
            >
              Nova seção
            </Button>
          </PageHeader>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <LoadingState container className="h-32" />
            </div>
          ) : (
            <div className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSectionDragEnd}
              >
                <SortableContext
                  items={sections.map((section) => section.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map((section) => {
                    const sectionFields = fields
                      .filter((field) => field.sectionId === section.id)
                      .sort((a, b) => a.order - b.order);

                    return (
                      <SortableSection
                        key={section.id}
                        section={section}
                        fields={sectionFields}
                        onFieldsReorder={(newFields) =>
                          handleFieldsReorder(section.id, newFields)
                        }
                        onEditField={(field) => {
                          setIsEditing(true);
                          setModalType('field');
                          setCurrentField(field);
                          setFormErrors({});
                          setIsModalOpen(true);
                        }}
                        onDeleteField={handleDeleteField}
                        onEditSection={() => {
                          setIsEditing(true);
                          setModalType('section');
                          setCurrentSection(section);
                          setFormErrors({});
                          setIsModalOpen(true);
                        }}
                        onDeleteSection={() => handleDeleteSection(section)}
                        onAddField={() => {
                          setIsEditing(false);
                          setModalType('field');
                          setCurrentField({ sectionId: section.id });
                          setFormErrors({});
                          setIsModalOpen(true);
                        }}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>

              {sections.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <p className="text-sm text-gray-500">
                    Nenhuma seção cadastrada. Clique em "Nova seção" para
                    começar.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormErrors({});
          }}
          title={
            modalType === 'section'
              ? isEditing
                ? 'Editar seção'
                : 'Nova seção'
              : isEditing
              ? 'Editar Campo'
              : 'Novo Campo'
          }
        >
          <Form
            onSubmit={handleSubmit}
            className="space-y-4"
            loadingKey={
              isEditing
                ? `edit-${modalType}-${
                    modalType === 'section'
                      ? currentSection.id
                      : currentField.id
                  }`
                : `new-${modalType}`
            }
          >
            <ValidationInput
              label="Nome"
              value={
                modalType === 'section'
                  ? currentSection.name || ''
                  : currentField.name || ''
              }
              onChange={(e) => {
                if (modalType === 'section') {
                  setCurrentSection({
                    ...currentSection,
                    name: e.target.value,
                  });
                } else {
                  setCurrentField({ ...currentField, name: e.target.value });
                }
              }}
              error={formErrors.name}
              required
            />

            {modalType === 'field' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={currentField.type || ''}
                    onChange={(e) =>
                      setCurrentField({
                        ...currentField,
                        type: e.target.value as CustomField['type'],
                        options: e.target.value === 'select' ? [] : undefined,
                        multipleSelect:
                          e.target.value === 'select' ? false : undefined,
                      })
                    }
                    className="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base shadow-sm"
                    required
                  >
                    <option value="">Selecione um tipo</option>
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                    <option value="date">Data</option>
                    <option value="select">Lista de seleção</option>
                  </select>
                  {formErrors.type && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.type}
                    </p>
                  )}
                </div>

                {currentField.type === 'select' && (
                  <>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="multipleSelect"
                        checked={currentField.multipleSelect || false}
                        onChange={(e) =>
                          setCurrentField({
                            ...currentField,
                            multipleSelect: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="multipleSelect"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Permite seleção múltipla
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Opções
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="mt-1 space-y-2">
                        {currentField.options?.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [
                                  ...(currentField.options || []),
                                ];
                                newOptions[index] = e.target.value;
                                setCurrentField({
                                  ...currentField,
                                  options: newOptions,
                                });
                              }}
                              className="flex-1 h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                            />
                            <Button
                              onClick={() => {
                                const newOptions = currentField.options?.filter(
                                  (_, i) => i !== index
                                );
                                setCurrentField({
                                  ...currentField,
                                  options: newOptions,
                                });
                              }}
                              variant="ghost"
                              className="px-4"
                              type="button"
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() =>
                            setCurrentField({
                              ...currentField,
                              options: [...(currentField.options || []), ''],
                            })
                          }
                          variant="secondary"
                          className="text-sm"
                          type="button"
                        >
                          Adicionar opção
                        </Button>
                      </div>
                      {formErrors.options && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.options}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="required"
                    checked={currentField.required || false}
                    onChange={(e) =>
                      setCurrentField({
                        ...currentField,
                        required: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="required"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Campo obrigatório
                  </label>
                </div>
              </>
            )}

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
                    ? `edit-${modalType}-${
                        modalType === 'section'
                          ? currentSection.id
                          : currentField.id
                      }`
                    : `new-${modalType}`
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

export default CustomFields;
