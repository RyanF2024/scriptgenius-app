'use client'

import { useToast, type ToastProps } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-sm">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <div
            key={id}
            className={cn(
              'mb-4 flex w-full items-center justify-between space-x-4 rounded-md border p-4 shadow-lg transition-all',
              'bg-background text-foreground',
              'data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[swipe=cancel]:transition-[transform_200ms_ease-out]',
              'data-[swipe=end]:animate-out data-[state=closed]:animate-hide data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut',
              'data-[swipe=cancel]:duration-200',
              'data-[state=open]:duration-300',
              'data-[state=open]:ease-in-out',
              'data-[state=open]:animate-in',
              'data-[swipe=end]:ease-out',
              'data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-80',
              'data-[state=open]:fade-in-0',
              'data-[state=open]:zoom-in-95',
              'data-[state=closed]:zoom-out-80',
              'data-[state=closed]:slide-out-to-right-1/2',
              'data-[state=open]:slide-in-from-right-1/2',
              'data-[state=open]:sm:slide-in-from-bottom-full'
            )}
            {...props}
          >
            <div className="flex-1 space-y-1">
              {title && (
                <p className="text-sm font-medium leading-none">{title}</p>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {action}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => {
                // Dismiss the toast
                document.dispatchEvent(
                  new CustomEvent('toast.dismiss', { detail: { id } })
                )
              }}
            >
              <Icons.close className="h-4 w-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}

export type { ToastProps } from './use-toast'
