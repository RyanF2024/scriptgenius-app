import { type FieldError, type UseFormRegisterReturn } from 'react-hook-form';
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
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';
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

export function BaseFormField(props: FormFieldProps) {
  const {
    label,
    description,
    error,
    className,
    fieldId,
    required = false,
    labelClassName,
    descriptionClassName,
    errorClassName,
    containerClassName,
    type,
    ...rest
  } = props;

  const descriptionId = `${fieldId}-description`;
  const errorId = error ? `${fieldId}-error` : undefined;
  
  const fieldProps = {
    id: fieldId,
    'aria-invalid': error ? 'true' : 'false',
    'aria-required': required ? 'true' : undefined,
    'aria-describedby': [
      description ? descriptionId : null,
      error ? errorId : null,
      props['aria-describedby'],
    ]
      .filter(Boolean)
      .join(' '),
    'aria-label': props['aria-label'],
    disabled: props.disabled,
    readOnly: props.readOnly,
    className: cn(
      error && 'border-red-500 focus-visible:ring-red-500',
      props.disabled && 'cursor-not-allowed opacity-50',
      className
    ),
    ...('registration' in rest ? rest.registration : {}),
  };

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return <Textarea {...fieldProps} {...(rest as TextareaFieldProps)} />;
      case 'select':
        return (
          <Select {...fieldProps} {...(rest as SelectFieldProps)}>
            {rest.placeholder && (
              <option value="" disabled>
                {rest.placeholder}
              </option>
            )}
            {rest.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      case 'checkbox':
        return <Checkbox {...fieldProps} {...(rest as CheckboxFieldProps)} />;
      case 'radio':
        return (
          <RadioGroup {...fieldProps} {...(rest as RadioFieldProps)}>
            {rest.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${fieldId}-${option.value}`}
                  value={option.value}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  {...fieldProps}
                />
                <Label htmlFor={`${fieldId}-${option.value}`}>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'switch':
        return <Switch {...fieldProps} {...(rest as SwitchFieldProps)} />;
      case 'slider':
        return <Slider {...fieldProps} {...(rest as SliderFieldProps)} />;
      default:
        return (
          <Input
            type={type}
            {...fieldProps}
            {...(rest as InputFieldProps)}
          />
        );
    }
  };

  return (
    <div 
      className={cn('space-y-2', containerClassName)}
      data-testid={`form-field-${fieldId}`}
    >
      {label && !['checkbox', 'switch'].includes(type) && (
        <Label
          htmlFor={fieldId}
          className={cn('block text-sm font-medium', labelClassName, {
            'after:ml-0.5 after:text-red-500 after:content-["*"]': required,
          })}
        >
          {label}
        </Label>
      )}
      <div 
        className={cn({
          'flex items-center': ['checkbox', 'switch', 'radio'].includes(type),
          'space-y-1': !['checkbox', 'switch', 'radio'].includes(type),
        })}
      >
        {renderField()}
        {(type === 'checkbox' || type === 'switch') && label && (
          <Label
            htmlFor={fieldId}
            className={cn('ml-2 text-sm font-medium cursor-pointer', labelClassName, {
              'opacity-50 cursor-not-allowed': props.disabled,
              'after:ml-0.5 after:text-red-500 after:content-["*"]': required,
            })}
          >
            {label}
          </Label>
        )}
      </div>
      {description && (
        <p 
          id={descriptionId}
          className={cn('text-sm text-muted-foreground', descriptionClassName, {
            'opacity-50': props.disabled,
          })}
        >
          {description}
        </p>
      )}
      {error && (
        <p 
          id={errorId}
          className={cn('text-sm text-red-500', errorClassName)}
          role="alert"
          aria-live="polite"
        >
          {error.message}
        </p>
      )}
    </div>
  );
}

type ConnectedFormFieldProps = Omit<FormFieldProps, 'fieldId' | 'registration'> & {
  /** Name of the field (must match the form schema) */
  name: string;
  /** Whether to generate a unique ID automatically */
  autoId?: boolean;
};

/**
 * A connected form field that integrates with react-hook-form
 * Automatically handles registration, validation, and error states
 */
export function FormField(props: ConnectedFormFieldProps) {
  const { name, autoId = true, ...rest } = props;
  const { register, formState: { errors } } = useFormContext();
  const autoGeneratedId = useId();
  const fieldId = autoId ? `${name}-${autoGeneratedId}` : name;
  
  return (
    <BaseFormField
      fieldId={fieldId}
      error={errors?.[name] as FieldError}
      registration={register(name, {
        disabled: props.disabled,
        required: props.required ? 'This field is required' : false,
      })}
      {...rest}
      disabled={props.disabled}
      required={props.required}
    />
  );
}
