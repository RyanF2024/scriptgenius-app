import { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input, type InputProps } from '@/components/ui/input';
import { Textarea, type TextareaProps } from '@/components/ui/textarea';
import { Select, type SelectProps } from '@/components/ui/select';
import { Checkbox, type CheckboxProps } from '@/components/ui/checkbox';
import { RadioGroup, type RadioGroupProps } from '@/components/ui/radio-group';
import { Switch, type SwitchProps } from '@/components/ui/switch';
import { Slider, type SliderProps } from '@/components/ui/slider';
import { useId } from 'react';

type BaseFieldProps = {
  /** The label text for the form field */
  label?: string;
  /** Help text that describes the field */
  description?: string;
  /** Error message to display when validation fails */
  error?: FieldError;
  /** Additional class names for the field */
  className?: string;
  /** Unique identifier for the field */
  fieldId: string;
  /** Whether the field is required */
  required?: boolean;
  /** Additional class names for the label */
  labelClassName?: string;
  /** Additional class names for the description */
  descriptionClassName?: string;
  /** Additional class names for the error message */
  errorClassName?: string;
  /** Additional class names for the container */
  containerClassName?: string;
  /** ARIA label for the field (used when label is not visible) */
  'aria-label'?: string;
  /** ARIA description for the field */
  'aria-describedby'?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is read-only */
  readOnly?: boolean;
};

type InputFieldProps = BaseFieldProps & {
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local';
  registration: Partial<UseFormRegisterReturn>;
} & Omit<InputProps, 'name' | 'id'>;

type TextareaFieldProps = BaseFieldProps & {
  type: 'textarea';
  registration: Partial<UseFormRegisterReturn>;
} & Omit<TextareaProps, 'name' | 'id'>;

type SelectFieldProps = BaseFieldProps & {
  type: 'select';
  options: { value: string; label: string }[];
  placeholder?: string;
  registration: Partial<UseFormRegisterReturn>;
} & Omit<SelectProps, 'name' | 'id'>;

type CheckboxFieldProps = BaseFieldProps & {
  type: 'checkbox';
  registration: Partial<UseFormRegisterReturn>;
} & Omit<CheckboxProps, 'name' | 'id'>;

type RadioFieldProps = BaseFieldProps & {
  type: 'radio';
  options: { value: string; label: string }[];
  registration: Partial<UseFormRegisterReturn>;
} & Omit<RadioGroupProps, 'name' | 'id'>;

type SwitchFieldProps = BaseFieldProps & {
  type: 'switch';
  registration: Partial<UseFormRegisterReturn>;
} & Omit<SwitchProps, 'name' | 'id'>;

type SliderFieldProps = BaseFieldProps & {
  type: 'slider';
  min?: number;
  max?: number;
  step?: number;
  registration: Partial<UseFormRegisterReturn>;
} & Omit<SliderProps, 'name' | 'id'>;

type FormFieldProps =
  | InputFieldProps
  | TextareaFieldProps
  | SelectFieldProps
  | CheckboxFieldProps
  | RadioFieldProps
  | SwitchFieldProps
  | SliderFieldProps;

/**
 * A flexible form field component that renders different input types based on the provided props.
 * Handles accessibility, validation, and styling consistently across all field types.
 */
export function BaseField(props: FormFieldProps) {
  const {
    type,
    label,
    description,
    error,
    className,
    fieldId,
    required,
    labelClassName,
    descriptionClassName,
    errorClassName,
    containerClassName,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    disabled,
    readOnly,
    registration,
    ...rest
  } = props;

  const generatedId = useId();
  const id = fieldId || generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const ariaDescribedByIds = [ariaDescribedBy, descriptionId, errorId].filter(Boolean).join(' ');

  const commonProps = {
    id,
    'aria-label': ariaLabel || label,
    'aria-describedby': ariaDescribedByIds || undefined,
    'aria-invalid': !!error,
    'aria-required': required,
    disabled,
    readOnly,
    ...registration,
  };

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return <Textarea {...commonProps} {...(rest as TextareaProps)} />;
      case 'select':
        return (
          <Select {...commonProps} {...(rest as SelectProps)}>
            {props.placeholder && (
              <option value="" disabled>
                {props.placeholder}
              </option>
            )}
            {props.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      case 'checkbox':
        return <Checkbox {...commonProps} {...(rest as CheckboxProps)} />;
      case 'radio':
        return (
          <RadioGroup {...commonProps} {...(rest as RadioGroupProps)}>
            {props.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${id}-${option.value}`}
                  value={option.value}
                  className="h-4 w-4 text-primary focus:ring-primary"
                  {...commonProps}
                />
                <Label htmlFor={`${id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'switch':
        return <Switch {...commonProps} {...(rest as SwitchProps)} />;
      case 'slider':
        return <Slider {...commonProps} {...(rest as SliderProps)} />;
      default:
        return <Input type={type} {...commonProps} {...(rest as InputProps)} />;
    }
  };

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && type !== 'checkbox' && type !== 'switch' && (
        <Label htmlFor={id} className={cn('block text-sm font-medium', labelClassName)}>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
      )}
      <div className={cn('relative', className)}>
        {renderField()}
        {type === 'checkbox' || type === 'switch' ? (
          <div className="flex items-center space-x-2">
            {renderField()}
            {label && (
              <Label htmlFor={id} className={cn('text-sm font-medium', labelClassName)}>
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
              </Label>
            )}
          </div>
        ) : null}
      </div>
      {description && (
        <p id={descriptionId} className={cn('text-sm text-muted-foreground', descriptionClassName)}>
          {description}
        </p>
      )}
      {error?.message && (
        <p id={errorId} className={cn('text-sm font-medium text-destructive', errorClassName)}>
          {error.message}
        </p>
      )}
    </div>
  );
}
