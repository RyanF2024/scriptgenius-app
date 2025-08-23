import { Input, InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

type FormInputProps = {
  label: string;
  error?: FieldError;
  description?: string;
  registration: Partial<UseFormRegisterReturn>;
} & InputProps;

export const FormInput = ({
  label,
  error,
  description,
  registration,
  className,
  ...props
}: FormInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={registration.name}>{label}</Label>
      <Input
        id={registration.name}
        className={cn(error && 'border-red-500', className)}
        aria-invalid={error ? 'true' : 'false'}
        {...registration}
        {...props}
      />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
};
