import { z } from 'zod';
import { VALIDATION_MESSAGES } from './validators';

type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'date'
  | 'time'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'slider';

type FieldConfig = {
  type: FieldType;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  patternMessage?: string;
  options?: { value: string; label: string }[];
  validate?: (value: any) => boolean | string | Promise<boolean | string>;
  defaultValue?: any;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  dependencies?: string[];
  conditional?: (data: any) => boolean;
};

type FormSchema = Record<string, FieldConfig>;

type InferFormSchema<T extends FormSchema> = {
  [K in keyof T]: T[K] extends { type: 'number' }
    ? number
    : T[K] extends { type: 'checkbox' | 'switch' }
    ? boolean
    : T[K] extends { type: 'select' | 'radio' }
    ? T[K]['options'] extends { value: infer V }[]
      ? V
      : string
    : string;
};

/**
 * Creates a Zod schema from a form configuration object
 * @param schema The form schema configuration
 * @returns A Zod schema with proper TypeScript types
 */
export function createFormSchema<T extends FormSchema>(
  schema: T
): z.ZodObject<{ [K in keyof T]: z.ZodType<InferFormSchema<T>[K]> }> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, config] of Object.entries(schema)) {
    const {
      type,
      required = false,
      minLength,
      maxLength,
      min,
      max,
      pattern,
      patternMessage,
      options,
      validate,
      defaultValue,
      conditional,
    } = config;

    let fieldSchema: z.ZodTypeAny;

    // Base schema based on field type
    switch (type) {
      case 'number':
        fieldSchema = z.number({
          required_error: VALIDATION_MESSAGES.required,
          invalid_type_error: 'Must be a number',
        });
        if (min !== undefined) {
          fieldSchema = fieldSchema.min(min, VALIDATION_MESSAGES.min(min));
        }
        if (max !== undefined) {
          fieldSchema = fieldSchema.max(max, VALIDATION_MESSAGES.max(max));
        }
        break;

      case 'email':
        fieldSchema = z
          .string({
            required_error: VALIDATION_MESSAGES.required,
          })
          .email(VALIDATION_MESSAGES.email);
        break;

      case 'password':
        fieldSchema = z
          .string({
            required_error: VALIDATION_MESSAGES.required,
          })
          .min(8, VALIDATION_MESSAGES.password.minLength)
          .regex(/[A-Z]/, VALIDATION_MESSAGES.password.uppercase)
          .regex(/[a-z]/, VALIDATION_MESSAGES.password.lowercase)
          .regex(/[0-9]/, VALIDATION_MESSAGES.password.number);
        break;

      case 'checkbox':
      case 'switch':
        fieldSchema = z.boolean({
          required_error: VALIDATION_MESSAGES.required,
        });
        break;

      case 'select':
      case 'radio':
        const values = options?.map((opt) => opt.value) || [];
        fieldSchema = z.enum([values[0], ...values.slice(1)] as [string, ...string[]], {
          required_error: VALIDATION_MESSAGES.required,
        });
        break;

      case 'date':
        fieldSchema = z.date({
          required_error: VALIDATION_MESSAGES.required,
          invalid_type_error: 'Please enter a valid date',
        });
        break;

      default:
        // text, textarea, tel, url, etc.
        fieldSchema = z.string({
          required_error: VALIDATION_MESSAGES.required,
        });
    }

    // Apply common validations
    if (minLength !== undefined) {
      fieldSchema = (fieldSchema as z.ZodString).min(
        minLength,
        VALIDATION_MESSAGES.minLength(minLength)
      );
    }

    if (maxLength !== undefined) {
      fieldSchema = (fieldSchema as z.ZodString).max(
        maxLength,
        VALIDATION_MESSAGES.maxLength(maxLength)
      );
    }

    if (pattern) {
      fieldSchema = (fieldSchema as z.ZodString).regex(
        pattern,
        patternMessage || 'Invalid format'
      );
    }

    // Apply custom validation
    if (validate) {
      fieldSchema = fieldSchema.refine(
        async (val) => {
          const result = await validate(val);
          return result === true || result === undefined;
        },
        {
          message: (val) => {
            const result = validate(val);
            return typeof result === 'string' ? result : 'Invalid value';
          },
        }
      ) as any;
    }

    // Make field optional if not required and has no default value
    if (!required && defaultValue === undefined) {
      fieldSchema = fieldSchema.optional();
    }

    // Apply conditional logic if provided
    if (conditional) {
      fieldSchema = z.preprocess((val, ctx) => {
        return conditional(ctx.parent) ? val : undefined;
      }, fieldSchema.optional());
    }

    // Set default value if provided
    if (defaultValue !== undefined) {
      fieldSchema = fieldSchema.default(defaultValue);
    }

    shape[key] = fieldSchema;
  }

  return z.object(shape) as any;
}

/**
 * Creates a form configuration object with proper TypeScript types
 * @param schema The form schema configuration
 * @returns The same schema with proper TypeScript types
 */
export function defineFormSchema<T extends FormSchema>(schema: T): T {
  return schema;
}

/**
 * Extracts the TypeScript type from a form schema
 */
export type InferFormType<T extends FormSchema> = z.infer<ReturnType<typeof createFormSchema<T>>>;
