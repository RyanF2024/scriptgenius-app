import * as React from 'react';

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

type Toast = {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
};

type ToastOptions = Omit<Toast, 'id'>;

type ToastContextType = {
  toasts: Toast[];
  toast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
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
          currentToasts.filter((toast) => toast.id !== id)
        );
      }, duration);
    }

    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((currentToasts) => 
      currentToasts.filter((toast) => toast.id !== id)
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
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function Toaster() {
  const { toasts, removeToast } = useToast();
  const { toast } = useToast();

  // Handle window events for showing toasts
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
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-md shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : toast.type === 'error'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : toast.type === 'warning'
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              : toast.type === 'info'
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-white text-gray-800 border border-gray-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{toast.title}</h3>
              {toast.description && (
                <p className="text-sm mt-1">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
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
}
