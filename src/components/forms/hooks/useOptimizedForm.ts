import { useCallback, useMemo } from 'react';
import { useForm as useRHF, type UseFormReturn, type FieldValues } from 'react-hook-form';
import { z } from 'zod';

type UseOptimizedFormOptions<T extends FieldValues> = {
  /**
   * The Zod schema for form validation
   */
  schema: z.ZodType<T>;
  /**
   * Default form values
   */
  defaultValues?: Partial<T>;
  /**
   * Callback when the form is submitted with valid data
   */
  onSubmit: (data: T) => void | Promise<void>;
  /**
   * Callback when the form submission fails validation
   */
  onError?: (errors: any) => void;
  /**
   * Whether to validate fields on blur
   * @default true
   */
  validateOnBlur?: boolean;
  /**
   * Whether to validate fields on change
   * @default false
   */
  validateOnChange?: boolean;
  /**
   * Whether to re-validate fields when they change
   * @default true
   */
  reValidateOnChange?: boolean;
  /**
   * The validation mode to use
   * @default 'onTouched'
   */
  mode?: 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all';
  /**
   * The re-validation mode to use
   * @default 'onChange'
   */
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
  /**
   * Whether to use native HTML5 validation
   * @default false
   */
  nativeValidation?: boolean;
  /**
   * Whether to validate all fields on submit, even if they haven't been touched
   * @default true
   */
  shouldValidateAllOnSubmit?: boolean;
};

/**
 * A performance-optimized version of react-hook-form's useForm hook
 * that reduces unnecessary re-renders and provides better TypeScript support
 */
export function useOptimizedForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  onError,
  validateOnBlur = true,
  validateOnChange = false,
  reValidateOnChange = true,
  mode = 'onTouched',
  reValidateMode = 'onChange',
  nativeValidation = false,
  shouldValidateAllOnSubmit = true,
}: UseOptimizedFormOptions<T>): UseFormReturn<T> {
  // Memoize the form methods to prevent unnecessary re-renders
  const methods = useRHF<T>({
    defaultValues: defaultValues as any,
    mode,
    reValidateMode,
    criteriaMode: 'all',
    shouldFocusError: true,
    shouldUnregister: false,
    shouldUseNativeValidation: nativeValidation,
    resolver: async (data, context, options) => {
      try {
        const result = await schema.safeParseAsync(data, { async: true });
        
        if (result.success) {
          return { values: result.data, errors: {} };
        }
        
        // Convert Zod errors to react-hook-form format
        const errors = result.error.errors.reduce((acc, error) => {
          const path = error.path.join('.');
          return {
            ...acc,
            [path]: {
              type: error.code,
              message: error.message,
            },
          };
        }, {} as Record<string, any>);
        
        return { values: {}, errors };
      } catch (error) {
        console.error('Validation error:', error);
        return { values: {}, errors: {} };
      }
    },
  });
  
  // Memoize the submit handler to prevent unnecessary re-renders
  const handleSubmit = useCallback(
    methods.handleSubmit(
      async (data) => {
        try {
          await onSubmit(data);
        } catch (error) {
          console.error('Form submission error:', error);
          onError?.(error);
        }
      },
      (errors) => {
        onError?.(errors);
      }
    ),
    [methods.handleSubmit, onError, onSubmit]
  );

  // Memoize the form state to prevent unnecessary re-renders
  const formState = useMemo(
    () => ({
      ...methods.formState,
      isDirty: methods.formState.isDirty,
      isSubmitted: methods.formState.isSubmitted,
      isSubmitting: methods.formState.isSubmitting,
      isSubmitSuccessful: methods.formState.isSubmitSuccessful,
      isValid: methods.formState.isValid,
      isValidating: methods.formState.isValidating,
      submitCount: methods.formState.submitCount,
      dirtyFields: methods.formState.dirtyFields,
      touchedFields: methods.formState.touchedFields,
      errors: methods.formState.errors,
    }),
    [
      methods.formState.isDirty,
      methods.formState.isSubmitted,
      methods.formState.isSubmitting,
      methods.formState.isSubmitSuccessful,
      methods.formState.isValid,
      methods.formState.isValidating,
      methods.formState.submitCount,
      methods.formState.dirtyFields,
      methods.formState.touchedFields,
      methods.formState.errors,
    ]
  );

  // Memoize the register function to prevent unnecessary re-renders
  const register = useCallback(
    (name: string, options: any = {}) => {
      const { onChange, onBlur, ...rest } = options;
      
      return {
        ...methods.register(name as any, {
          ...rest,
          onChange: (e) => {
            if (validateOnChange) {
              methods.trigger(name as any);
            }
            onChange?.(e);
          },
          onBlur: (e) => {
            if (validateOnBlur) {
              methods.trigger(name as any);
            }
            onBlur?.(e);
          },
        }),
        'data-testid': `form-field-${name}`,
      };
    },
    [methods.register, methods.trigger, validateOnBlur, validateOnChange]
  );

  // Memoize the setValue function to prevent unnecessary re-renders
  const setValue = useCallback(
    (name: string, value: any, options: any = {}) => {
      methods.setValue(name as any, value, {
        ...options,
        shouldValidate: options.shouldValidate ?? reValidateOnChange,
        shouldDirty: options.shouldDirty ?? true,
        shouldTouch: options.shouldTouch ?? true,
      });
    },
    [methods.setValue, reValidateOnChange]
  );

  // Memoize the reset function to prevent unnecessary re-renders
  const reset = useCallback(
    (values?: any, options: any = {}) => {
      methods.reset(values, {
        ...options,
        keepErrors: options.keepErrors ?? false,
        keepDirty: options.keepDirty ?? false,
        keepIsSubmitted: options.keepIsSubmitted ?? false,
        keepTouched: options.keepTouched ?? false,
        keepIsValid: options.keepIsValid ?? false,
        keepSubmitCount: options.keepSubmitCount ?? false,
      });
    },
    [methods.reset]
  );

  // Return the memoized form methods
  return useMemo(
    () => ({
      ...methods,
      register,
      handleSubmit,
      formState,
      setValue,
      reset,
      trigger: methods.trigger,
      getValues: methods.getValues,
      getFieldState: methods.getFieldState,
      setError: methods.setError,
      clearErrors: methods.clearErrors,
      setFocus: methods.setFocus,
      unregister: methods.unregister,
      control: methods.control,
      watch: methods.watch,
    }),
    [
      methods,
      register,
      handleSubmit,
      formState,
      setValue,
      reset,
    ]
  ) as UseFormReturn<T>;
}
