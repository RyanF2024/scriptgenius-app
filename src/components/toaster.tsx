'use client';

import { useEffect, useState } from 'react';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastType;
  duration?: number;
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<{
        title: string;
        description?: string;
        variant?: ToastType;
        duration?: number;
      }>;

      const newToast: ToastMessage = {
        id: Math.random().toString(36).substring(2, 9),
        title: customEvent.detail.title,
        description: customEvent.detail.description,
        variant: customEvent.detail.variant || 'default',
        duration: customEvent.detail.duration,
      };

      setToasts((currentToasts) => [...currentToasts, newToast]);

      if (newToast.duration) {
        setTimeout(() => {
          setToasts((currentToasts) =>
            currentToasts.filter((toast) => toast.id !== newToast.id)
          );
        }, newToast.duration);
      }
    };

    window.addEventListener('show-toast', handleToast as EventListener);

    return () => {
      window.removeEventListener('show-toast', handleToast as EventListener);
    };
  }, []);

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant }) => (
        <Toast key={id} variant={variant}>
          <div className="grid gap-1">
            <ToastTitle>{title}</ToastTitle>
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
