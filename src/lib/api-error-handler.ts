import { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    return {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'An unknown error occurred' };
}

export function useApiErrorHandler() {
  const { toast } = useToast();

  const handleError = (error: unknown, defaultMessage = 'An error occurred') => {
    const apiError = handleApiError(error);
    toast({
      title: 'Error',
      description: apiError.message || defaultMessage,
      variant: 'error',
    });
    return apiError;
  };

  return { handleError };
}
