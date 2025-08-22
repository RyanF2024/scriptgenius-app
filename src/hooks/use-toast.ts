'use client';

import * as React from 'react';
import { useCallback } from 'react';

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ToastConfig {
  title?: string;
  description?: string;
  duration?: number;
  type?: ToastType;
}

const TOAST_DURATION = 5000;

const useToast = () => {
  const toast = useCallback(
    ({ title, description, duration = TOAST_DURATION, type = 'default' }: ToastConfig) => {
      // This will be replaced with the actual toast implementation
      console.log(`[${type.toUpperCase()}] ${title}`, description);
      
      // In a real implementation, this would dispatch a custom event or use a context
      const event = new CustomEvent('show-toast', {
        detail: {
          title,
          description,
          duration,
          variant: type,
        },
      });
      window.dispatchEvent(event);
    },
    []
  );

  const success = useCallback(
    (title: string, description?: string, duration?: number) =>
      toast({ title, description, duration, type: 'success' }),
    [toast]
  );

  const error = useCallback(
    (title: string, description?: string, duration?: number) =>
      toast({ title, description, duration, type: 'error' }),
    [toast]
  );

  const warning = useCallback(
    (title: string, description?: string, duration?: number) =>
      toast({ title, description, duration, type: 'warning' }),
    [toast]
  );

  const info = useCallback(
    (title: string, description?: string, duration?: number) =>
      toast({ title, description, duration, type: 'info' }),
    [toast]
  );

  return {
    toast,
    success,
    error,
    warning,
    info,
  };
};

export { useToast };
export type { ToastType, ToastConfig };
