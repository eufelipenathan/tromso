'use client';

import { CustomFields } from '@/components/form/custom-fields';
import { FormSection } from '@/components/ui/form-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { FormMode } from '@/lib/form-modes';
import { FORM_MODES, getCompanyFieldVisibility } from '@/lib/form-modes';
import { phoneMask } from '@/lib/masks';
import { cn } from '@/lib/utils';
import type { ContactFormData } from '@/lib/validations';
import { contactSchema } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CompanyField } from './company-field';

interface ContactFormProps {
  initialData?: Partial<ContactFormData> & {
    id?: string;
    company?: { id: string; name: string };
  };
  onSubmit: (data: ContactFormData) => Promise<void>;
  selectedCompany?: { id: string; name: string };
  mode?: FormMode;
}

export function ContactForm({
  initialData,
  onSubmit,
  selectedCompany,
  mode = FORM_MODES.STANDALONE,
}: ContactFormProps) {
  const { toast } = useToast();
  const [currentCompany, setCurrentCompany] = useState<
    { id: string; name: string } | undefined
  >(selectedCompany || initialData?.company);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset: resetForm,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || null,
      phone: initialData?.phone || null,
      position: initialData?.position || null,
      companyId: currentCompany?.id || '',
    },
  });

  useEffect(() => {
    if (selectedCompany) {
      setValue('companyId', selectedCompany.id);
      setCurrentCompany(selectedCompany);
    }
  }, [selectedCompany, setValue]);

  useEffect(() => {
    if (initialData?.company) {
      setValue('companyId', initialData.company.id);
      setCurrentCompany(initialData.company);
    }
  }, [initialData?.company, setValue]);

  const handleFormSubmit = async (data: ContactFormData) => {
    try {
      await onSubmit(data);
      resetForm();
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao processar o formulário',
      });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const masked = phoneMask(value);
    setValue('phone', masked || null);
  };

  const handleCompanyChange = (
    companyId: string,
    companyData?: { id: string; name: string },
  ) => {
    setValue('companyId', companyId);
    setCurrentCompany(companyData);
  };

  const companyFieldMode = getCompanyFieldVisibility(mode);

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      <FormSection title="Informações básicas" defaultOpen>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="required">
              Nome
            </Label>
            <Input
              id="name"
              {...register('name')}
              className={cn(
                errors.name &&
                  'border-destructive focus-visible:ring-destructive',
              )}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Input id="position" {...register('position')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="exemplo@email.com"
              className={cn(
                errors.email &&
                  'border-destructive focus-visible:ring-destructive',
              )}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={watch('phone') || ''}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              className={cn(
                errors.phone &&
                  'border-destructive focus-visible:ring-destructive',
              )}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <CompanyField
              mode={companyFieldMode}
              selectedCompany={currentCompany}
              error={errors.companyId?.message}
              onChange={handleCompanyChange}
            />
          </div>
        </div>
      </FormSection>

      <CustomFields
        entityType="contact"
        register={register}
        watch={watch}
        errors={errors}
        setValue={setValue}
      />
    </form>
  );
}
