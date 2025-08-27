import { type FieldError, type FieldErrors, type Path } from 'react-hook-form';
import { z } from 'zod';

/**
 * Default validation error messages
 */
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be at most ${max}`,
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be at most ${max} characters`,
  pattern: 'Invalid format',
  url: 'Please enter a valid URL',
  number: 'Must be a number',
  integer: 'Must be a whole number',
  positive: 'Must be a positive number',
  negative: 'Must be a negative number',
  date: 'Please enter a valid date',
  before: (date: Date) => `Must be before ${date.toLocaleDateString()}`,
  after: (date: Date) => `Must be after ${date.toLocaleDateString()}`,
  match: (field: string) => `Must match ${field}`,
  oneOf: 'Invalid selection',
  invalid: 'Invalid value',
} as const;

type ValidationMessage = string | ((...args: any[]) => string);
type ValidationMessages = Record<string, ValidationMessage>;

/**
 * Creates a validation message resolver for react-hook-form
 * @param messages Custom validation messages
 * @returns A message resolver function
 */
export function createValidationMessageResolver<T extends Record<string, any>>(
  messages: ValidationMessages = {}
) {
  return (error: FieldError | undefined, fieldName: string) => {
    if (!error) return undefined;
    
    const { type, message } = error;
    
    // Return custom message if provided
    if (message) return message;
    
    // Get message from custom messages
    const customMessage = messages[`${fieldName}.${type}`] || messages[type as string];
    if (customMessage) {
      return typeof customMessage === 'function' 
        ? customMessage((error as any).params) 
        : customMessage;
    }
    
    // Fall back to default messages
    switch (type) {
      case 'required':
        return VALIDATION_MESSAGES.required;
      case 'min':
        return VALIDATION_MESSAGES.min((error as any).params?.min);
      case 'max':
        return VALIDATION_MESSAGES.max((error as any).params?.max);
      case 'minLength':
        return VALIDATION_MESSAGES.minLength((error as any).params?.minLength);
      case 'maxLength':
        return VALIDATION_MESSAGES.maxLength((error as any).params?.maxLength);
      case 'pattern':
        return VALIDATION_MESSAGES.pattern;
      case 'validate':
        return VALIDATION_MESSAGES.invalid;
      default:
        return 'This field is invalid';
    }
  };
}

/**
 * Creates a Zod schema with custom error messages
 */
export function createZodSchema<T extends z.ZodTypeAny>(
  schema: T,
  messages: Record<string, string> = {}
): T {
  return schema.superRefine((data, ctx) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        const message = messages[`${path}.${issue.code}`] || messages[issue.code] || issue.message;
        ctx.addIssue({
          ...issue,
          message,
        });
      });
      return false;
    }
    return true;
  }) as T;
}

/**
 * Gets the first error message for a field
 */
export function getFieldError<T extends Record<string, any>>(
  errors: FieldErrors<T>,
  name: Path<T>
): string | undefined {
  const field = name.split('.').reduce((obj, key) => {
    if (!obj) return undefined;
    return obj[key as keyof typeof obj];
  }, errors as any);
  
  if (!field) return undefined;
  
  if (field.message) {
    return field.message as string;
  }
  
  if (field.type === 'required') {
    return VALIDATION_MESSAGES.required;
  }
  
  return VALIDATION_MESSAGES.invalid;
}

/**
 * Checks if a field has an error
 */
export function hasError<T extends Record<string, any>>(
  errors: FieldErrors<T>,
  name: Path<T>
): boolean {
  return !!getFieldError(errors, name);
}

/**
 * Creates a validation schema for a password field
 */
export function passwordSchema(options: {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
  messages?: {
    minLength?: string;
    uppercase?: string;
    lowercase?: string;
    number?: string;
    specialChar?: string;
  };
} = {}) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecialChar = true,
    messages = {},
  } = options;
  
  return z.string()
    .min(minLength, messages.minLength || `Password must be at least ${minLength} characters`)
    .refine(
      (val) => !requireUppercase || /[A-Z]/.test(val),
      messages.uppercase || 'Password must contain at least one uppercase letter'
    )
    .refine(
      (val) => !requireLowercase || /[a-z]/.test(val),
      messages.lowercase || 'Password must contain at least one lowercase letter'
    )
    .refine(
      (val) => !requireNumber || /[0-9]/.test(val),
      messages.number || 'Password must contain at least one number'
    )
    .refine(
      (val) => !requireSpecialChar || /[^A-Za-z0-9]/.test(val),
      messages.specialChar || 'Password must contain at least one special character'
    );
}

/**
 * Creates a validation schema for a confirm password field
 */
export function confirmPasswordSchema(
  passwordField: string = 'password',
  message: string = 'Passwords do not match'
) {
  return z.string().refine(
    (val, ctx) => {
      return val === ctx.parent[passwordField as keyof typeof ctx.parent];
    },
    {
      message,
    }
  );
}

/**
 * Creates a validation schema for an email field
 */
export function emailSchema(message: string = VALIDATION_MESSAGES.email) {
  return z.string().email(message);
}

/**
 * Creates a validation schema for a URL field
 */
export function urlSchema(message: string = VALIDATION_MESSAGES.url) {
  return z.string().url(message);
}

/**
 * Creates a validation schema for a date field
 */
export function dateSchema(options: {
  min?: Date;
  max?: Date;
  minMessage?: string | ((min: Date) => string);
  maxMessage?: string | ((max: Date) => string);
} = {}) {
  let schema = z.date({
    required_error: VALIDATION_MESSAGES.required,
    invalid_type_error: VALIDATION_MESSAGES.date,
  });
  
  if (options.min) {
    const message = typeof options.minMessage === 'function'
      ? options.minMessage(options.min)
      : options.minMessage || `Must be after ${options.min.toLocaleDateString()}`;
    
    schema = schema.min(options.min, message);
  }
  
  if (options.max) {
    const message = typeof options.maxMessage === 'function'
      ? options.maxMessage(options.max)
      : options.maxMessage || `Must be before ${options.max.toLocaleDateString()}`;
    
    schema = schema.max(options.max, message);
  }
  
  return schema;
}
