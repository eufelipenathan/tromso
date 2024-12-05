"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "@/components/ui/form-section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CustomField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  fullWidth: boolean;
  multiple: boolean;
  visible: boolean;
  editable: boolean;
  options?: string;
  order: number;
}

interface CustomFieldsProps {
  entityType: "company" | "contact" | "deal";
  register: any;
  watch: any;
  errors: any;
  setValue: any;
}

export function CustomFields({
  entityType,
  register,
  watch,
  errors,
  setValue,
}: CustomFieldsProps) {
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSections() {
      try {
        const response = await fetch(
          `/api/form-sections?entityType=${entityType}`
        );
        if (!response.ok) throw new Error("Failed to load sections");
        const data = await response.json();
        setSections(data);
      } catch (error) {
        console.error("Error loading sections:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSections();
  }, [entityType]);

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading custom fields...
      </div>
    );
  }

  const renderField = (field: CustomField) => {
    if (!field.visible) return null;

    const commonProps = {
      id: field.id,
      disabled: !field.editable,
      className: cn(
        errors[field.id] && "border-destructive focus-visible:ring-destructive",
        field.fullWidth && "col-span-2"
      ),
      ...register(field.id, {
        required: field.required ? "Este campo é obrigatório" : false,
      }),
    };

    switch (field.type) {
      case "textarea":
        return <Textarea {...commonProps} />;

      case "select":
        const options = field.options?.split("\n").filter(Boolean) || [];
        return (
          <Select
            value={watch(field.id) || ""}
            onValueChange={(value) => setValue(field.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return <Input type={field.type} {...commonProps} />;
    }
  };

  return (
    <>
      {sections.map((section) => {
        const hasRequiredFields = section.fields.some(
          (field: CustomField) => field.required && field.visible
        );

        return (
          <FormSection
            key={section.id}
            title={section.name}
            hasRequiredFields={hasRequiredFields}
          >
            <div className="grid grid-cols-2 gap-4">
              {section.fields
                .sort((a: CustomField, b: CustomField) => a.order - b.order)
                .map((field: CustomField) => (
                  <div
                    key={field.id}
                    className={cn("space-y-2", field.fullWidth && "col-span-2")}
                  >
                    <Label
                      htmlFor={field.id}
                      className={field.required ? "required" : ""}
                    >
                      {field.name}
                    </Label>
                    {renderField(field)}
                    {errors[field.id] && (
                      <p className="text-sm text-destructive">
                        {errors[field.id].message}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </FormSection>
        );
      })}
    </>
  );
}
