// Field utilities
export * from './fieldUtils';

// Validation utilities
export * from './validation';

// Re-export common types
export type { FieldError, FieldErrors, UseFormReturn } from 'react-hook-form';

export {
  // Common validation schemas
  passwordSchema,
  confirmPasswordSchema,
  emailSchema,
  urlSchema,
  dateSchema,
  
  // Validation utilities
  createValidationMessageResolver,
  createZodSchema,
  getFieldError,
  hasError,
  
  // Field utilities
  getFieldClasses,
  getLabelClasses,
  getErrorClasses,
  getDescriptionClasses,
  getErrorMessage,
  getFormFieldState,
  createFieldRegister,
  createFieldController,
  
  // Constants
  VALIDATION_MESSAGES,
} from './validation';
