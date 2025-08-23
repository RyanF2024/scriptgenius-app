'use client';

import { toast as sonnerToast } from 'sonner';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  title: string;
  description?: string;
  duration?: number;
  variant?: ToastVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const TOAST_DURATION = 5000;

export const useToast = () => {
  const toast = ({
    title,
    description,
    duration = TOAST_DURATION,
    variant = 'default',
    action,
  }: ToastConfig) => {
    const toastOptions = {
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    };

    switch (variant) {
      case 'success':
        return sonnerToast.success(title, { description, ...toastOptions });
      case 'error':
        return sonnerToast.error(title, { description, ...toastOptions });
      case 'warning':
        return sonnerToast.warning(title, { description, ...toastOptions });
      case 'info':
        return sonnerToast.info(title, { description, ...toastOptions });
      default:
        return sonnerToast(title, { description, ...toastOptions });
    }
  };

  const success = (title: string, description?: string, duration?: number) =>
    toast({ title, description, duration, variant: 'success' });

  const error = (title: string, description?: string, duration?: number) =>
    toast({ title, description, duration, variant: 'error' });

  const warning = (title: string, description?: string, duration?: number) =>
    toast({ title, description, duration, variant: 'warning' });

  const info = (title: string, description?: string, duration?: number) =>
    toast({ title, description, duration, variant: 'info' });

  return { toast, success, error, warning, info };
};
