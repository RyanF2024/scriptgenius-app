import { useCallback, useState } from 'react';
import { useFormContext, type UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

type SubmitHandler<T> = (data: T) => Promise<void> | void;

type UseOptimizedFormSubmitOptions<T> = {
  /**
   * The function to call when the form is submitted
   */
  onSubmit: SubmitHandler<T>;
  /**
   * Success message to display when the form is submitted successfully
   */
  successMessage?: string | ((data: T) => string);
  /**
   * Error message to display when the form submission fails
   */
  errorMessage?: string | ((error: unknown) => string);
  /**
   * Whether to reset the form after a successful submission
   * @default false
   */
  resetOnSuccess?: boolean;
  /**
   * Whether to show toast notifications
   * @default true
   */
  showToasts?: boolean;
  /**
   * Callback when the form is about to be submitted
   */
  onBeforeSubmit?: () => void;
  /**
   * Callback when the form is submitted successfully
   */
  onSuccess?: (data: T) => void;
  /**
   * Callback when the form submission fails
   */
  onError?: (error: unknown) => void;
  /**
   * Callback when the form submission is complete (success or error)
   */
  onComplete?: () => void;
};

/**
 * A hook that handles form submission with optimistic updates and error handling
 * @param options Configuration options
 * @returns Form submission handler and state
 */
export function useOptimizedFormSubmit<T>(
  options: UseOptimizedFormSubmitOptions<T>
) {
  const {
    onSubmit,
    successMessage = 'Form submitted successfully!',
    errorMessage = 'An error occurred while submitting the form',
    resetOnSuccess = false,
    showToasts = true,
    onBeforeSubmit,
    onSuccess,
    onError,
    onComplete,
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const form = useFormContext<T>();

  const handleSubmit = useCallback(
    async (data: T) => {
      try {
        setIsSubmitting(true);
        setSubmitError(null);
        setIsSuccess(false);
        onBeforeSubmit?.();

        // Execute the submission
        const result = onSubmit(data);
        
        // Handle both sync and async submissions
        if (result instanceof Promise) {
          await result;
        }

        // Handle success
        setIsSuccess(true);
        onSuccess?.(data);

        // Show success message
        if (showToasts) {
          const message = typeof successMessage === 'function' 
            ? successMessage(data) 
            : successMessage;
          toast.success(message);
        }

        // Reset form if needed
        if (resetOnSuccess) {
          form.reset();
        }

        return { success: true as const, data };
      } catch (error) {
        // Handle error
        console.error('Form submission error:', error);
        setSubmitError(error);
        onError?.(error);

        // Show error message
        if (showToasts) {
          const message = typeof errorMessage === 'function'
            ? errorMessage(error)
            : errorMessage;
          toast.error(message);
        }

        return { success: false as const, error };
      } finally {
        setIsSubmitting(false);
        onComplete?.();
      }
    },
    [
      form,
      onBeforeSubmit,
      onComplete,
      onError,
      onSuccess,
      onSubmit,
      resetOnSuccess,
      showToasts,
      successMessage,
      errorMessage,
    ]
  );

  // Create a memoized submit handler that can be passed to the form
  const submitHandler = useCallback(
    (e?: React.BaseSyntheticEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      return form.handleSubmit((data) => handleSubmit(data as T))(e);
    },
    [form, handleSubmit]
  );

  return {
    /**
     * Submit handler function that can be passed to a form's onSubmit prop
     */
    handleSubmit: submitHandler,
    /**
     * Whether the form is currently being submitted
     */
    isSubmitting,
    /**
     * Whether the form was submitted successfully
     */
    isSuccess,
    /**
     * The error that occurred during submission, if any
     */
    error: submitError,
    /**
     * Reset the form submission state
     */
    reset: useCallback(() => {
      setIsSubmitting(false);
      setSubmitError(null);
      setIsSuccess(false);
    }, []),
  };
}

/**
 * A higher-order component that provides form submission handling to a form
 * @param WrappedComponent The form component to enhance
 * @param options Form submission options
 * @returns Enhanced form component with submission handling
 */
export function withFormSubmit<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  options: UseOptimizedFormSubmitOptions<any>
) {
  return function WithFormSubmit(props: Omit<T, keyof ReturnType<typeof useOptimizedFormSubmit>>) {
    const form = useFormContext();
    const submitProps = useOptimizedFormSubmit({
      ...options,
      onSubmit: async (data: any) => {
        await options.onSubmit(data);
        return form.reset();
      },
    });

    return <WrappedComponent {...(props as T)} {...submitProps} />;
  };
}

/**
 * A hook that provides form submission handling with loading and error states
 * @param form The form instance from useForm
 * @param options Form submission options
 * @returns Form submission handler and state
 */
export function useFormSubmit<T>(
  form: UseFormReturn<T>,
  options: Omit<UseOptimizedFormSubmitOptions<T>, 'onSubmit'> & {
    onSubmit: (data: T, form: UseFormReturn<T>) => Promise<void> | void;
  }
) {
  const {
    onSubmit,
    ...rest
  } = options;

  return useOptimizedFormSubmit({
    ...rest,
    onSubmit: (data: T) => onSubmit(data, form),
  });
}
