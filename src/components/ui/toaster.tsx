'use client';

import * as React from 'react';
import { useToast, ToastType } from './use-toast';

export function Toaster() {
  const { toasts, removeToast } = useToast();

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
