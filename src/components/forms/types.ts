export interface FormStyles {
  container: string;
  label: string;
  required: string;
  input: string;
  inputError: string;
  errorIcon: string;
  errorMessage: string;
}

export interface FormFieldProps {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  validate?: (value: any) => { isValid: boolean; error?: string };
  mask?: (value: string) => string;
  fieldKey?: string;
}