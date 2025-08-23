import * as React from 'react';
import { useForm, FormProvider as HookFormProvider, useFormContext } from 'react-hook-form';
import type { UseFormReturn, SubmitHandler, FieldValues, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';
import { cn } from '@/lib/utils';
import { Label } from '../label';
import { Slot } from '@radix-ui/react-slot';

export interface FormProps<TFormValues extends FieldValues> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form: UseFormReturn<TFormValues>;
  onSubmit: SubmitHandler<TFormValues>;
  className?: string;
  children?: React.ReactNode;
  options?: UseFormProps<TFormValues>;
  schema?: ZodType<any, any, TFormValues>;
  id?: string;
}

const Form = <TFormValues extends FieldValues>({
  children,
  className = '',
  onSubmit,
  options,
  schema,
  id,
  ...props
}: FormProps<TFormValues>) => {
  const methods = useForm<TFormValues>({
    ...options,
    resolver: schema ? zodResolver(schema) : undefined,
  });

  return (
    <HookFormProvider {...methods}>
      <form
        className={cn('space-y-6', className)}
        onSubmit={methods.handleSubmit(onSubmit)}
        {...props}
        id={id}
      >
        {children}
      </form>
    </HookFormProvider>
  );
}

type FormFieldContextValue = {
  name: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = ({
  ...props
}: {
  name: string;
  children: React.ReactNode;
}) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      {props.children}
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  return {
    name: fieldContext.name,
    formItemId: `${fieldContext.name}-form-item`,
    formDescriptionId: `${fieldContext.name}-form-item-description`,
    formMessageId: `${fieldContext.name}-form-item-message`,
    ...fieldState,
  };
};

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('space-y-2', className)} {...props} />
  );
});
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label> & {
    optional?: boolean;
  }
>(({ className, optional, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    >
      {props.children}
      {optional && (
        <span className="text-muted-foreground ml-1 text-xs">(optional)</span>
      )}
    </Label>
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
};
