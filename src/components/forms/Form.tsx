import { type ReactNode } from 'react';
import { FormProvider, useForm, type SubmitHandler, type UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';

type FormProps<TSchema extends z.ZodType> = {
  children: ReactNode;
  schema: TSchema;
  onSubmit: SubmitHandler<z.infer<TSchema>>;
  defaultValues?: UseFormProps<z.infer<TSchema>>['defaultValues'];
  className?: string;
};

export function Form<TSchema extends z.ZodType>({
  children,
  schema,
  onSubmit,
  defaultValues,
  className,
}: FormProps<TSchema>) {
  const methods = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={className}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}
