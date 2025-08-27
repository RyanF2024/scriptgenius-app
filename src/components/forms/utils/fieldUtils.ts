import { type FieldError, type UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';

type GetFieldClassesProps = {
  hasError: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'filled';
  size?: 'sm' | 'md' | 'lg';
};

/**
 * Generates consistent CSS classes for form fields based on their state
 */
export function getFieldClasses({
  hasError = false,
  isDisabled = false,
  isReadOnly = false,
  className = '',
  variant = 'default',
  size = 'md',
}: GetFieldClassesProps) {
  const baseClasses = [
    'flex w-full rounded-md border border-input bg-background text-sm ring-offset-background',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-colors duration-200',
  ];

  const variantClasses = {
    default: 'border-input bg-background',
    outline: 'border border-input bg-transparent',
    ghost: 'border-0 bg-transparent shadow-none',
    filled: 'border-0 bg-muted/50',
  };

  const sizeClasses = {
    sm: 'h-9 px-3 py-1 text-sm',
    md: 'h-10 px-3 py-2',
    lg: 'h-11 px-4 py-3 text-base',
  };

  const stateClasses = [
    hasError && 'border-destructive text-destructive',
    isDisabled && 'opacity-50 cursor-not-allowed',
    isReadOnly && 'bg-muted/50',
  ];

  return cn(
    ...baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    stateClasses,
    className
  );
}

type GetLabelClassesProps = {
  hasError: boolean;
  isRequired?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

/**
 * Generates consistent CSS classes for form labels
 */
export function getLabelClasses({
  hasError = false,
  isRequired = false,
  className = '',
  size = 'md',
}: GetLabelClassesProps) {
  const baseClasses = [
    'block font-medium',
    'transition-colors duration-200',
  ];

  const sizeClasses = {
    sm: 'text-xs mb-1',
    md: 'text-sm mb-1.5',
    lg: 'text-base mb-2',
  };

  const stateClasses = [
    hasError ? 'text-destructive' : 'text-foreground',
    isRequired && "after:content-['*'] after:ml-0.5 after:text-destructive",
  ];

  return cn(baseClasses, sizeClasses[size], stateClasses, className);
}

type GetErrorClassesProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

/**
 * Generates consistent CSS classes for error messages
 */
export function getErrorClasses({ className = '', size = 'md' }: GetErrorClassesProps = {}) {
  const baseClasses = [
    'mt-1 text-sm font-medium text-destructive',
    'transition-opacity duration-200',
  ];

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return cn(baseClasses, sizeClasses[size], className);
}

type GetDescriptionClassesProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

/**
 * Generates consistent CSS classes for description text
 */
export function getDescriptionClasses({ className = '', size = 'md' }: GetDescriptionClassesProps = {}) {
  const baseClasses = [
    'mt-1 text-muted-foreground',
    'transition-opacity duration-200',
  ];

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return cn(baseClasses, sizeClasses[size], className);
}

/**
 * Extracts error message from a field error
 */
export function getErrorMessage(error?: FieldError | string): string | undefined {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  return error.message;
}

/**
 * Gets form field state from react-hook-form
 */
export function getFormFieldState<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  name: keyof T
) {
  const { formState } = form;
  const error = formState.errors[name] as FieldError | undefined;
  const isTouched = !!formState.touchedFields[name];
  const isDirty = !!formState.dirtyFields[name];
  const isValid = !error && isTouched;
  const isInvalid = !!error && isTouched;

  return {
    error,
    isTouched,
    isDirty,
    isValid,
    isInvalid,
    errorMessage: getErrorMessage(error),
  };
}

/**
 * Creates a field registration function with consistent props
 */
export function createFieldRegister<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  options: {
    name: keyof T;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
  }
) {
  const { name, required, disabled, readOnly } = options;
  const { register, formState } = form;
  const { error, isTouched } = getFormFieldState(form, name);

  return {
    ...register(name as string, { required }),
    id: String(name),
    'aria-invalid': !!error,
    'aria-required': required,
    'aria-describedby': error ? `${String(name)}-error` : undefined,
    disabled: disabled || form.formState.isSubmitting || readOnly,
    readOnly: readOnly || form.formState.isSubmitting,
    'data-invalid': !!error,
    'data-touched': isTouched,
    'data-required': required,
  };
}

/**
 * Creates a field controller with consistent props
 */
export function createFieldController<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  name: keyof T
) {
  const { control } = form;
  const { error, isTouched } = getFormFieldState(form, name);

  return {
    name: String(name),
    control,
    rules: { required: form.formState.errors[name]?.type === 'required' },
    render: ({
      field,
      fieldState,
    }: {
      field: any;
      fieldState: { error?: FieldError };
    }) => ({
      ...field,
      id: String(name),
      'aria-invalid': !!fieldState.error,
      'aria-describedby': fieldState.error ? `${String(name)}-error` : undefined,
      disabled: form.formState.isSubmitting,
      readOnly: form.formState.isSubmitting,
      'data-invalid': !!fieldState.error,
      'data-touched': isTouched,
      'data-required': form.formState.errors[name]?.type === 'required',
    }),
  };
}
