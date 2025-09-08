import { FC, ReactNode, createContext, useState, useCallback, useContext, useMemo, useEffect } from 'react';

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastOptions extends Omit<Toast, 'id'> {}

interface ToastContextType {
  toasts: Toast[];
  toast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ duration = 5000, ...options }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((currentToasts) => [
      ...currentToasts,
      { id, ...options, duration },
    ]);

    if (duration !== 0) {
      setTimeout(() => {
        setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({
    toasts,
    toast,
    removeToast,
  }), [toasts, toast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toaster: FC = () => {
  const { toasts, removeToast, toast } = useToast();

  useEffect(() => {
    const handleShowToast = (event: Event) => {
      const customEvent = event as CustomEvent<{
        title: string;
        description?: string;
        type?: ToastType;
        duration?: number;
      }>;

      toast({
        title: customEvent.detail.title,
        description: customEvent.detail.description,
        type: customEvent.detail.type || 'default',
        duration: customEvent.detail.duration,
      });
    };

    window.addEventListener('show-toast', handleShowToast as EventListener);
    return () => {
      window.removeEventListener('show-toast', handleShowToast as EventListener);
    };
  }, [toast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`p-4 rounded-md shadow-lg ${
            t.type === 'success' ? 'bg-green-100 text-green-800' :
            t.type === 'error' ? 'bg-red-100 text-red-800' :
            t.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
            t.type === 'info' ? 'bg-blue-100 text-blue-800' :
            'bg-white text-gray-800'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium">{t.title}</h3>
              {t.description && <p className="text-sm mt-1">{t.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="ml-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export { useToast };
