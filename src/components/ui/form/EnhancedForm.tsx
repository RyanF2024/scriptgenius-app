import { type ReactNode } from 'react';
import { 
  FormProvider as RHFProvider, 
  useForm as useRHF, 
  type SubmitHandler, 
  type UseFormProps as RHFUseFormProps,
  type FieldValues
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z, type ZodSchema } from 'zod';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/button';

type FormProps<TSchema extends ZodSchema> = {
  /** Form content */
  children: ReactNode;
  
  /** Zod schema for form validation */
  schema: TSchema;
  
  /** Form submission handler */
  onSubmit: SubmitHandler<z.infer<TSchema>>;
  
  /** Default form values */
  defaultValues?: RHFUseFormProps<z.infer<TSchema>>['defaultValues'];
  
  /** Form class name */
  className?: string;
  
  /** Form layout class name */
  formClassName?: string;
  
  /** Submit button text */
  submitText?: string;
  
  /** Submit button props */
  submitButtonProps?: Omit<ButtonProps, 'type' | 'disabled'>;
  
  /** Show loading state */
  isLoading?: boolean;
  
  /** Show reset button */
  showReset?: boolean;
  
  /** Reset button text */
  resetText?: string;
  
  /** Reset button props */
  resetButtonProps?: Omit<ButtonProps, 'type' | 'onClick'>;
  
  /** On reset handler */
  onReset?: () => void;
  
  /** Custom form actions */
  actions?: ReactNode;
  
  /** Disable form */
  disabled?: boolean;
};

export function EnhancedForm<TSchema extends ZodSchema>({
  children,
  schema,
  onSubmit,
  defaultValues,
  className,
  formClassName,
  submitText = 'Submit',
  submitButtonProps,
  isLoading = false,
  showReset = false,
  resetText = 'Reset',
  resetButtonProps,
  onReset,
  actions,
  disabled = false,
}: FormProps<TSchema>) {
  const methods = useRHF<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
  });

  const handleReset = () => {
    methods.reset();
    onReset?.();
  };

  return (
    <RHFProvider {...methods}>
      <div className={cn('w-full', className)}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className={cn('space-y-6', formClassName)}
          noValidate
        >
          {children}
          
          <div className="flex items-center justify-end gap-4 pt-2">
            {actions}
            
            {showReset && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isLoading || disabled}
                {...resetButtonProps}
              >
                {resetText}
              </Button>
            )}
            
            <Button 
              type="submit" 
              disabled={!methods.formState.isDirty || isLoading || disabled}
              loading={isLoading}
              {...submitButtonProps}
            >
              {submitText}
            </Button>
          </div>
        </form>
      </div>
    </RHFProvider>
  );
}

type FormFieldProps = {
  /** Field name */
  name: string;
  
  /** Field label */
  label?: string;
  
  /** Field description */
  description?: string;
  
  /** Field class name */
  className?: string;
  
  /** Field label class name */
  labelClassName?: string;
  
  /** Field description class name */
  descriptionClassName?: string;
  
  /** Field error class name */
  errorClassName?: string;
  
  /** Field container class name */
  containerClassName?: string;
  
  /** Field is required */
  required?: boolean;
  
  /** Field is disabled */
  disabled?: boolean;
};

export function useEnhancedForm<TSchema extends FieldValues>() {
  return useRHF<TSchema>();
}

/**
 * Use this hook to create a form with server-side validation
 * 
 * @example
 * const { form, field } = useFormWithServerValidation({
 *   schema: userSchema,
 *   defaultValues: {
 *     name: '',
 *     email: '',
 *   },
 *   onSubmit: async (data) => {
 *     const result = await fetch('/api/user', {
 *       method: 'POST',
 *       body: JSON.stringify(data),
 *     });
 *     
 *     if (!result.ok) {
 *       const error = await result.json();
 *       return { errors: error.errors };
 *     }
 *     
 *     return { success: true };
 *   },
 * });
 */
export function useFormWithServerValidation<TSchema extends ZodSchema>({
  schema,
  defaultValues,
  onSubmit,
}: {
  schema: TSchema;
  defaultValues?: RHFUseFormProps<z.infer<TSchema>>['defaultValues'];
  onSubmit: (data: z.infer<TSchema>) => Promise<{ errors?: Record<string, string>; success?: boolean }>;
}) {
  const methods = useRHF<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    const result = await onSubmit(data);
    
    if (result.errors) {
      Object.entries(result.errors).forEach(([field, message]) => {
        methods.setError(field as any, {
          type: 'server',
          message,
        });
      });
    }
    
    return result;
  });

  return {
    ...methods,
    handleSubmit,
    field: (name: string, props?: Partial<FormFieldProps>) => ({
      name,
      ...props,
    }),
  };
}
