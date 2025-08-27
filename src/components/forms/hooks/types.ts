import { type FieldError, type UseFormReturn } from 'react-hook-form';

type UseFormAccessibilityProps = {
  /** The name of the field to enhance */
  fieldName: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom error message to display */
  errorMessage?: string | ((error: FieldError) => string);
  /** Whether to announce errors to screen readers */
  announceErrors?: boolean;
  /** Debounce time for error announcements in ms */
  debounceTime?: number;
};

type UseFormFocusManagementProps = {
  /** Array of field names to track for focus management */
  fieldNames: string[];
};

type UseFormA11yProps = {
  /** ID of the form element */
  formId?: string;
  /** Whether to announce form submission status */
  announceSubmitStatus?: boolean;
};

type UseOptimizedFormOptions<T extends Record<string, any>> = {
  /** The Zod schema for form validation */
  schema: any; // Using any to avoid circular dependencies with Zod types
  /** Default form values */
  defaultValues?: Partial<T>;
  /** Whether to validate fields on blur */
  validateOnBlur?: boolean;
  /** Whether to validate fields on change */
  validateOnChange?: boolean;
  /** Whether to re-validate fields when they change */
  reValidateOnChange?: boolean;
  /** The validation mode to use */
  mode?: 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all';
  /** The re-validation mode to use */
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
  /** Whether to use native HTML5 validation */
  nativeValidation?: boolean;
  /** Whether to validate all fields on submit */
  shouldValidateAllOnSubmit?: boolean;
};

type UseOptimizedFormSubmitOptions<T> = {
  /** The function to call when the form is submitted */
  onSubmit: (data: T) => Promise<void> | void;
  /** Success message to display when the form is submitted successfully */
  successMessage?: string | ((data: T) => string);
  /** Error message to display when the form submission fails */
  errorMessage?: string | ((error: unknown) => string);
  /** Whether to reset the form after a successful submission */
  resetOnSuccess?: boolean;
  /** Whether to show toast notifications */
  showToasts?: boolean;
  /** Callback when the form is about to be submitted */
  onBeforeSubmit?: () => void;
  /** Callback when the form is submitted successfully */
  onSuccess?: (data: T) => void;
  /** Callback when the form submission fails */
  onError?: (error: unknown) => void;
  /** Callback when the form submission is complete (success or error) */
  onComplete?: () => void;
};

type SubmitHandler<T> = (data: T) => Promise<void> | void;

type UseFormSubmitProps<T> = UseOptimizedFormSubmitOptions<T> & {
  form: UseFormReturn<T>;
};

export type {
  UseFormAccessibilityProps,
  UseFormFocusManagementProps,
  UseFormA11yProps,
  UseOptimizedFormOptions,
  UseOptimizedFormSubmitOptions,
  SubmitHandler,
  UseFormSubmitProps,
};
