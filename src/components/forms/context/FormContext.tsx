import { createContext, useContext, useId, useMemo } from 'react';
import { useForm as useRHF, FormProvider as RHFProvider, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, type ZodSchema } from 'zod';

type FormContextType<T extends ZodSchema> = {
  formId: string;
  methods: UseFormReturn<z.infer<T>>;
  schema: T;
};

const FormContext = createContext<FormContextType<any> | undefined>(undefined);

type FormProviderProps<T extends ZodSchema> = {
  children: React.ReactNode;
  schema: T;
  defaultValues?: Partial<z.infer<T>>;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
  formId?: string;
};

/**
 * Provider component that wraps your form with React Hook Form context
 * and provides form utilities to child components.
 */
export function FormProvider<T extends ZodSchema>({
  children,
  schema,
  defaultValues,
  onSubmit,
  formId: propFormId,
}: FormProviderProps<T>) {
  const generatedId = useId();
  const formId = propFormId || generatedId;
  
  const methods = useRHF<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const value = useMemo(
    () => ({
      formId,
      methods,
      schema,
    }),
    [formId, methods, schema]
  );

  return (
    <RHFProvider {...methods}>
      <FormContext.Provider value={value}>
        <form
          id={formId}
          onSubmit={methods.handleSubmit((data) => {
            return onSubmit(data);
          })}
          className="space-y-6"
          noValidate
        >
          {children}
        </form>
      </FormContext.Provider>
    </RHFProvider>
  );
}

/**
 * Hook to access the form context
 * @throws Error if used outside of a FormProvider
 */
export function useFormContext<T extends ZodSchema>() {
  const context = useContext(FormContext) as FormContextType<T> | undefined;
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}

/**
 * Hook to create a form with validation and submission handling
 */
export function useForm<T extends ZodSchema>({
  schema,
  defaultValues,
  onSubmit,
}: {
  schema: T;
  defaultValues?: Partial<z.infer<T>>;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
}) {
  const methods = useRHF<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Handle any errors from the submission
      console.error('Form submission error:', error);
      throw error;
    }
  });

  return {
    ...methods,
    handleSubmit,
    formState: methods.formState,
    register: methods.register,
    control: methods.control,
    setValue: methods.setValue,
    getValues: methods.getValues,
    watch: methods.watch,
    reset: methods.reset,
  };
}
