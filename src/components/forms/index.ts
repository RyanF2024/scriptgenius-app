// Core form components
export { Form } from './Form';
export { useForm } from './Form';

// Form fields
export { BaseField } from './fields/BaseField';

// Form layouts
export { FormLayout, FormSection, FormActions, FormGrid } from './layouts/FormLayout';

// Re-exports from react-hook-form for convenience
export {
  useForm as useRHForm,
  useFormContext,
  useFieldArray,
  useWatch,
  useController,
  Controller,
  type UseFormReturn,
  type UseFormProps,
  type FieldErrors,
  type FieldValues,
  type SubmitHandler,
  type SubmitErrorHandler,
  type UseFieldArrayReturn,
  type UseFieldArrayProps,
  type UseControllerProps,
  type ControllerRenderProps,
  type ControllerFieldState,
  type ControllerRenderProps,
  type UseFormStateReturn,
  type UseFormSetValue,
  type UseFormGetValues,
  type UseFormTrigger,
  type UseFormClearErrors,
  type UseFormSetError,
  type UseFormReset,
  type UseFormWatch,
  type UseFormHandleSubmit,
  type UseFormRegisterReturn,
  type UseFormSetFocus,
  type UseFormUnregister,
} from 'react-hook-form';

// Re-exports from @hookform/resolvers for convenience
export { zodResolver } from '@hookform/resolvers/zod';

// Re-exports from zod for convenience
export { z } from 'zod';

// Types
export type {
  // From our form components
  FormFieldProps,
  InputFieldProps,
  TextareaFieldProps,
  SelectFieldProps,
  CheckboxFieldProps,
  RadioFieldProps,
  SwitchFieldProps,
  SliderFieldProps,
  // From react-hook-form
  FieldError,
  // From zod
  ZodType,
  ZodTypeDef,
  ZodObject,
  ZodRawShape,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodDate,
  ZodArray,
  ZodEnum,
  ZodNativeEnum,
  ZodOptional,
  ZodNullable,
  ZodEffects,
  ZodDefault,
  ZodPromise,
  ZodIntersection,
  ZodUnion,
  ZodTuple,
  ZodRecord,
  ZodLazy,
  ZodLiteral,
  ZodNever,
  ZodVoid,
  ZodAny,
  ZodUnknown,
  ZodNull,
  ZodUndefined,
  ZodNaN,
  ZodBigInt,
  ZodSymbol,
  ZodVoid,
  ZodAny,
  ZodUnknown,
  ZodNever,
  ZodNull,
  ZodUndefined,
  ZodNaN,
  ZodBigInt,
  ZodSymbol,
} from './types';

// Hooks
export { useFormAccessibility } from './hooks/useFormAccessibility';
export { useOptimizedForm } from './hooks/useOptimizedForm';
export { useOptimizedFormSubmit } from './hooks/useOptimizedFormSubmit';

// Validation utilities
export { createValidationSchema } from './validations/schema';

export * from './validations';

// Re-export all form components for easier imports
export * from './Form';

// Export form context
export { FormProvider } from './context/FormContext';

// Export form field components
export { default as InputField } from './fields/InputField';
export { default as TextareaField } from './fields/TextareaField';
export { default as SelectField } from './fields/SelectField';
export { default as CheckboxField } from './fields/CheckboxField';
export { default as RadioGroupField } from './fields/RadioGroupField';
export { default as SwitchField } from './fields/SwitchField';
export { default as SliderField } from './fields/SliderField';
