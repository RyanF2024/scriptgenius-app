'use client';

import { useEffect, useState } from 'react';
import { Toast } from './toast';
import { useToast } from './use-toast';

type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  variant: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      const { title, description, variant = 'default', duration = 5000 } = event.detail;
      
      const newToast = {
        id: Math.random().toString(36).substring(2, 11),
        title,
        description,
        variant,
      };

      setToasts((prevToasts) => [...prevToasts, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prevToasts) =>
            prevToasts.filter((toast) => toast.id !== newToast.id)
          );
        }, duration);
      }
    };

    // @ts-ignore - CustomEvent type is not properly recognized
    window.addEventListener('show-toast', handleToast);
    return () => {
      // @ts-ignore
      window.removeEventListener('show-toast', handleToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {children}
      <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-xs w-full">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onOpenChange={(open) => !open && removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
}
