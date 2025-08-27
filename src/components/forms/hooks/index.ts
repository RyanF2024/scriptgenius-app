// Export all hooks for easier importing
export * from './useFormAccessibility';
export * from './useOptimizedForm';
export * from './useOptimizedFormSubmit';

// Re-export react-hook-form hooks for convenience
export {
  useFormContext,
  useFieldArray,
  useWatch,
  useController,
  useFormState,
  useController as useFormController,
  useWatch as useFormWatch,
  useFormState as useFormStateContext,
  useFieldArray as useFormFieldArray,
} from 'react-hook-form';

// Export types
export type {
  // From useFormAccessibility
  UseFormAccessibilityProps,
  UseFormFocusManagementProps,
  UseFormA11yProps,
  // From useOptimizedForm
  UseOptimizedFormOptions,
  // From useOptimizedFormSubmit
  UseOptimizedFormSubmitOptions,
  SubmitHandler,
} from './types';
