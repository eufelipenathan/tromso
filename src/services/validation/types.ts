export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRule<T = any> {
  validate: (value: T) => ValidationResult;
  message: string;
}

export interface FieldValidator<T = any> {
  validate: (value: T) => ValidationResult;
  mask?: (value: string) => string;
  format?: (value: T) => string;
}