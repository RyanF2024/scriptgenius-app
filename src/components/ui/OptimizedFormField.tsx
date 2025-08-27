'use client';

import * as React from 'react';
import { Controller, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';

type OptimizedFormFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  name: FieldPath<TFieldValues>;
  render: (props: {
    field: {
      value: any;
      onChange: (value: any) => void;
      onBlur: () => void;
      ref: React.Ref<any>;
    };
    fieldState: {
      error?: { message?: string };
    };
  }) => React.ReactElement;
  className?: string;
  label?: string;
  description?: string;
};

export function OptimizedFormField<TFieldValues extends FieldValues = FieldValues>({
  name,
  render,
  className,
  label,
  description,
}: OptimizedFormFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = useFormContext<TFieldValues>();
  const error = errors[name];

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium leading-none">
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={(fieldProps) => (
          <>
            {render(fieldProps)}
            {error?.message && (
              <p className="text-sm font-medium text-destructive">
                {error.message as string}
              </p>
            )}
            {description && !error?.message && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
}

// Create a memoized version of the component
export const MemoizedFormField = React.memo(OptimizedFormField) as typeof OptimizedFormField;
