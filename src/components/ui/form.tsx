'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { 
  Controller, 
  FormProvider as RHFProvider, 
  useFormContext as useRHFContext,
  type UseFormReturn,
  type FieldValues,
  type Path,
  type FieldPath,
  type FieldPathValue,
} from 'react-hook-form';
import { cn } from '@/lib/utils';
import { useOptimizedForm } from '@/hooks/useOptimizedForm';

// Lazy load heavy form components
const DynamicLabel = dynamic(() => import('@/components/ui/label'), {
  loading: () => <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />,
  ssr: false,
});

// Memoized form field context
const FormFieldContext = React.createContext<{ name: string } | null>(null);

// Memoized form field component
const FormField = React.memo(
  ({ name, render, ...props }: any) => {
    const contextValue = React.useMemo(() => ({ name }), [name]);
    
    return (
      <FormFieldContext.Provider value={contextValue}>
        <Controller
          name={name}
          render={(fieldProps) => (
            <div className="space-y-2">
              {render({ field: fieldProps.field, fieldState: fieldProps.fieldState })}
            </div>
          )}
          {...props}
        />
      </FormFieldContext.Provider>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if name or control changes
    return prevProps.name === nextProps.name && 
           prevProps.control === nextProps.control;
  }
);
FormField.displayName = 'FormField';

// Memoized form item component
const FormItem = React.memo(({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const id = React.useId();
  const contextValue = React.useMemo(() => ({ id }), [id]);
  
  return (
    <div className={cn('space-y-2', className)} {...props} />
  );
});
FormItem.displayName = 'FormItem';

// Memoized form label component
const FormLabel = React.memo(({ className, ...props }: any) => {
  return (
    <DynamicLabel
      className={cn(className)}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

// Memoized form control component
const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        {...props}
      />
    );
  }
);
FormControl.displayName = 'FormControl';

// Memoized form description component
const FormDescription = React.memo(({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

// Memoized form message component
const FormMessage = React.memo(({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return children ? (
    <p
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {children}
    </p>
  ) : null;
});
FormMessage.displayName = 'FormMessage';

// Memoized Form component to prevent unnecessary re-renders
const Form = React.memo(({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<typeof RHFProvider>) => {
  return (
    <RHFProvider {...props}>
      <form className={cn('space-y-6', className)}>
        {children}
      </form>
    </RHFProvider>
  );
});
Form.displayName = 'Form';

// Enhanced useForm hook
export function useForm<T extends FieldValues>(
  ...args: Parameters<typeof useOptimizedForm<T>>
) {
  return useOptimizedForm<T>(...args);
}

// Re-export types for better DX
export type { UseFormReturn, FieldValues, FieldPath, FieldPathValue };

// Export optimized components
export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useRHFContext as useFormContext,
};

export default Form;
