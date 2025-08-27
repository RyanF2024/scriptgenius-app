import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

type SubmitHandler<T> = (data: T) => Promise<void> | void;
type OnSuccess<T> = (data: T) => void;
type OnError = (error: Error) => void;

interface UseOptimizedFormSubmitOptions<T> {
  onSuccess?: OnSuccess<T>;
  onError?: OnError;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimizedFormSubmit<T>(
  submitHandler: SubmitHandler<T>,
  options: UseOptimizedFormSubmitOptions<T> = {}
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = useCallback(
    async (data: T) => {
      if (isSubmitting) return;

      setIsSubmitting(true);
      setError(null);

      try {
        await submitHandler(data);
        
        if (!isMounted.current) return;
        
        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        
        if (options.onSuccess) {
          options.onSuccess(data);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        
        if (!isMounted.current) return;
        
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        } else {
          toast.error(options.errorMessage || error.message || 'Something went wrong');
        }
      } finally {
        if (isMounted.current) {
          setIsSubmitting(false);
        }
      }
    },
    [isSubmitting, options, submitHandler]
  );

  return {
    handleSubmit,
    isSubmitting,
    error,
    reset: useCallback(() => setError(null), []),
  };
}
