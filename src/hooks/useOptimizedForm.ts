'use client';

import { useMemo } from 'react';
import { useForm as useRhfForm } from 'react-hook-form';
import type { UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

type FormOptions = {
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  reValidateMode?: 'onBlur' | 'onChange' | 'onSubmit';
  shouldFocusError?: boolean;
};

export function useOptimizedForm<T extends FieldValues>(
  schema: z.ZodType<T>,
  defaultValues?: Partial<T>,
  options: FormOptions = {}
): UseFormReturn<T> {
  const form = useRhfForm<T>({
    resolver: zodResolver(schema as any), // Type assertion to handle ZodType
    defaultValues: defaultValues as any,
    mode: options.mode || 'onBlur',
    reValidateMode: options.reValidateMode || 'onChange',
    shouldFocusError: options.shouldFocusError ?? true,
  });

  // Memoize the form methods to prevent unnecessary re-renders
  const memoizedForm = useMemo(() => {
    const reset = (...args: Parameters<typeof form.reset>) => form.reset(...args);
    const handleSubmit = (...args: Parameters<typeof form.handleSubmit>) => 
      form.handleSubmit(...args);
    
    return {
      ...form,
      reset,
      handleSubmit,
    };
  }, [form]);

  return memoizedForm;
}
