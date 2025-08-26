import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  type?: ToastType;
  onDismiss: () => void;
}

const toastVariants = {
  default: 'bg-white border border-gray-200',
  success: 'bg-green-50 border border-green-200',
  error: 'bg-red-50 border border-red-200',
  warning: 'bg-yellow-50 border border-yellow-200',
  info: 'bg-blue-50 border border-blue-200',
};

export function Toast({
  title,
  description,
  type = 'default',
  className,
  onDismiss,
  ...props
}: ToastProps) {
  return (
    <div
      className={cn(
        'relative flex items-center p-4 rounded-lg shadow-md max-w-md w-full',
        toastVariants[type],
        className
      )}
      {...props}
    >
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-4 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
