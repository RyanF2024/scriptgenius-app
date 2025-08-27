import { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { z } from 'zod';
import { InputProps } from '@/components/ui/input';
import { TextareaProps } from '@/components/ui/textarea';
import { SelectProps } from '@/components/ui/select';
import { CheckboxProps } from '@/components/ui/checkbox';
import { RadioGroupProps } from '@/components/ui/radio-group';
import { SwitchProps } from '@/components/ui/switch';
import { SliderProps } from '@/components/ui/slider';

export type BaseFieldProps = {
  /** The label text for the form field */
  label?: string;
  /** Help text that describes the field */
  description?: string;
  /** Error message to display when validation fails */
  error?: FieldError;
  /** Additional class names for the field */
  className?: string;
  /** Unique identifier for the field */
  fieldId?: string;
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

export type InputFieldProps = BaseFieldProps & {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local';
  registration?: Partial<UseFormRegisterReturn>;
} & Omit<InputProps, 'name' | 'id'>;

export type TextareaFieldProps = BaseFieldProps & {
  type?: 'textarea';
  registration?: Partial<UseFormRegisterReturn>;
} & Omit<TextareaProps, 'name' | 'id'>;

export type SelectFieldProps = BaseFieldProps & {
  type?: 'select';
  options: { value: string; label: string }[];
  placeholder?: string;
  registration?: Partial<UseFormRegisterReturn>;
} & Omit<SelectProps, 'name' | 'id'>;

export type CheckboxFieldProps = BaseFieldProps & {
  type?: 'checkbox';
  registration?: Partial<UseFormRegisterReturn>;
} & Omit<CheckboxProps, 'name' | 'id'>;

export type RadioFieldProps = BaseFieldProps & {
  type?: 'radio';
  options: { value: string; label: string }[];
  registration?: Partial<UseFormRegisterReturn>;
} & Omit<RadioGroupProps, 'name' | 'id'>;

export type SwitchFieldProps = BaseFieldProps & {
  type?: 'switch';
  registration?: Partial<UseFormRegisterReturn>;
} & Omit<SwitchProps, 'name' | 'id'>;

export type SliderFieldProps = BaseFieldProps & {
  type?: 'slider';
  min?: number;
  max?: number;
  step?: number;
  registration?: Partial<UseFormRegisterReturn>;
} & Omit<SliderProps, 'name' | 'id'>;

export type FormFieldProps =
  | InputFieldProps
  | TextareaFieldProps
  | SelectFieldProps
  | CheckboxFieldProps
  | RadioFieldProps
  | SwitchFieldProps
  | SliderFieldProps;

// Re-export zod types for convenience
export type {
  z,
  ZodType,
  ZodTypeDef,
  ZodObject,
  ZodRawShape,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodDate,
  ZodArray,
  ZodEnum,
  ZodNativeEnum,
  ZodOptional,
  ZodNullable,
  ZodEffects,
  ZodDefault,
  ZodPromise,
  ZodIntersection,
  ZodUnion,
  ZodTuple,
  ZodRecord,
  ZodLazy,
  ZodLiteral,
  ZodNever,
  ZodVoid,
  ZodAny,
  ZodUnknown,
  ZodNull,
  ZodUndefined,
  ZodNaN,
  ZodBigInt,
  ZodSymbol,
} from 'zod';

// Re-export react-hook-form types for convenience
export type {
  UseFormReturn,
  UseFormProps,
  FieldErrors,
  FieldValues,
  SubmitHandler,
  SubmitErrorHandler,
  UseFieldArrayReturn,
  UseFieldArrayProps,
  UseControllerProps,
  ControllerRenderProps,
  ControllerFieldState,
  UseFormStateReturn,
  UseFormSetValue,
  UseFormGetValues,
  UseFormTrigger,
  UseFormClearErrors,
  UseFormSetError,
  UseFormReset,
  UseFormWatch,
  UseFormHandleSubmit,
  UseFormRegisterReturn,
  UseFormSetFocus,
  UseFormUnregister,
  FieldError,
} from 'react-hook-form';
