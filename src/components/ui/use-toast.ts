import * as React from 'react';

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

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback(({ duration = 5000, ...options }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((currentToasts) => [
      ...currentToasts,
      { id, ...options, duration },
    ]);

    if (duration !== 0) {
      setTimeout(() => {
        setToasts((currentToasts) => 
          currentToasts.filter((t) => t.id !== id)
        );
      }, duration);
    }

    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((currentToasts) => 
      currentToasts.filter((t) => t.id !== id)
    );
  }, []);

  const value = React.useMemo(() => ({
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
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const { toast } = useToast();

  React.useEffect(() => {
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
    <div className="fixed top-4 right-4 z-50 space-y-2">
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

export { ToastProvider, useToast };
