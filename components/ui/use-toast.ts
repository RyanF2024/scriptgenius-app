'use client'

import * as React from 'react'

export interface ToastProps {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  duration?: number
  action?: React.ReactNode
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback(
    ({ title, description, duration = 5000, action }: Omit<ToastProps, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      
      setToasts((currentToasts) => [
        ...currentToasts,
        { id, title, description, duration, action },
      ])

      // Auto-dismiss after duration
      if (duration > 0) {
        setTimeout(() => {
          setToasts((currentToasts) =>
            currentToasts.filter((toast) => toast.id !== id)
          )
        }, duration)
      }

      return id
    },
    []
  )

  const dismiss = React.useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    )
  }, [])

  // Handle dismiss events from the toaster
  React.useEffect(() => {
    const handleDismiss = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string }>
      if (customEvent.detail?.id) {
        dismiss(customEvent.detail.id)
      }
    }

    document.addEventListener('toast.dismiss', handleDismiss)
    return () => document.removeEventListener('toast.dismiss', handleDismiss)
  }, [dismiss])

  return {
    toasts,
    toast,
    dismiss,
  }
}
