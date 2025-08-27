import { type ReactNode, forwardRef } from 'react';
import { useForm as useRHF, type UseFormReturn, type SubmitHandler, type UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z, type ZodType } from 'zod';
import { cn } from '@/lib/utils';

type FormProps<TSchema extends ZodType> = {
  /** Form content */
  children: ReactNode | ((methods: UseFormReturn<z.infer<TSchema>>) => ReactNode);
  
  /** Zod schema for form validation */
  schema: TSchema;
  
  /** Form submission handler */
  onSubmit: SubmitHandler<z.infer<TSchema>>;
  
  /** Default form values */
  defaultValues?: UseFormProps<z.infer<TSchema>>['defaultValues'];
  
  /** Additional class name for the form */
  className?: string;
  
  /** Form layout style */
  layout?: 'vertical' | 'horizontal' | 'inline';
  
  /** Whether to show a loading state */
  isLoading?: boolean;
  
  /** Whether the form is disabled */
  disabled?: boolean;
  
  /** Form ID (auto-generated if not provided) */
  id?: string;
  
  /** Additional props for the form element */
  formProps?: React.FormHTMLAttributes<HTMLFormElement>;
};

/**
 * A flexible form component that handles form state, validation, and submission.
 * Built on top of React Hook Form and Zod for type-safe form handling.
 * 
 * @example
 * ```tsx
 * const schema = z.object({
 *   email: z.string().email('Invalid email'),
 *   password: z.string().min(8, 'Password must be at least 8 characters'),
 * });
 * 
 * <Form
 *   schema={schema}
 *   onSubmit={(data) => console.log(data)}
 *   defaultValues={{ email: '', password: '' }}
 * >
 *   {({ register, formState: { errors } }) => (
 *     <>
 *       <InputField
 *         label="Email"
 *         type="email"
 *         error={errors.email}
 *         {...register('email')}
 *       />
 *       <InputField
 *         label="Password"
 *         type="password"
 *         error={errors.password}
 *         {...register('password')}
 *       />
 *       <Button type="submit">Submit</Button>
 *     </>
 *   )}
 * </Form>
 * ```
 */
const Form = forwardRef<HTMLFormElement, FormProps<any>>(function Form<TSchema extends ZodType>(
  {
    children,
    schema,
    onSubmit,
    defaultValues,
    className,
    layout = 'vertical',
    isLoading = false,
    disabled = false,
    id,
    formProps = {},
  }: FormProps<TSchema>,
  ref
) {
  const methods = useRHF<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const layoutClasses = {
    vertical: 'space-y-4',
    horizontal: 'space-y-4 md:grid md:grid-cols-4 md:gap-4 md:items-start',
    inline: 'flex flex-wrap items-end gap-4',
  };

  return (
    <form
      ref={ref}
      id={id}
      onSubmit={methods.handleSubmit(onSubmit)}
      className={cn(layoutClasses[layout], className)}
      noValidate
      {...formProps}
    >
      {typeof children === 'function' ? children(methods) : children}
    </form>
  );
});

export { Form };

type UseFormReturnType<TSchema extends ZodType> = UseFormReturn<z.infer<TSchema>> & {
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** Whether the form has been touched */
  isDirty: boolean;
  /** Whether the form is valid */
  isValid: boolean;
  /** Form submission handler */
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
};

/**
 * Hook to create a form with validation and submission handling
 * 
 * @example
 * ```tsx
 * const { register, handleSubmit, formState: { errors } } = useForm({
 *   schema: userSchema,
 *   defaultValues: { name: '', email: '' },
 *   onSubmit: (data) => console.log(data),
 * });
 * ```
 */
function useForm<TSchema extends ZodType>({
  schema,
  defaultValues,
  onSubmit,
}: {
  schema: TSchema;
  defaultValues?: Partial<z.infer<TSchema>>;
  onSubmit: (data: z.infer<TSchema>) => void | Promise<void>;
}): UseFormReturnType<TSchema> {
  const methods = useRHF<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  });

  return {
    ...methods,
    handleSubmit,
    isSubmitting: methods.formState.isSubmitting,
    isDirty: methods.formState.isDirty,
    isValid: methods.formState.isValid,
  };
}

export { useForm };
