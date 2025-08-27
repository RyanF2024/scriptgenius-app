import { z } from 'zod';

/**
 * Common validation messages
 */
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minLength: (length: number) => `Must be at least ${length} characters`,
  maxLength: (length: number) => `Must be at most ${length} characters`,
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be at most ${max}`,
  url: 'Please enter a valid URL',
  password: {
    minLength: 'Password must be at least 8 characters',
    uppercase: 'Must contain at least one uppercase letter',
    lowercase: 'Must contain at least one lowercase letter',
    number: 'Must contain at least one number',
    special: 'Must contain at least one special character',
    match: 'Passwords do not match',
  },
};

/**
 * Creates a password validation schema with common requirements
 */
export const passwordSchema = z
  .string()
  .min(8, VALIDATION_MESSAGES.password.minLength)
  .regex(/[A-Z]/, VALIDATION_MESSAGES.password.uppercase)
  .regex(/[a-z]/, VALIDATION_MESSAGES.password.lowercase)
  .regex(/[0-9]/, VALIDATION_MESSAGES.password.number)
  .regex(/[^A-Za-z0-9]/, VALIDATION_MESSAGES.password.special);

/**
 * Creates a confirm password validation schema
 */
export const confirmPasswordSchema = (passwordField = 'password') =>
  z.string().refine(
    (value, ctx) => {
      const password = (ctx.parent as any)[passwordField];
      return value === password;
    },
    {
      message: VALIDATION_MESSAGES.password.match,
    }
  );

/**
 * Creates a URL validation schema with optional protocol
 */
export const urlSchema = z.union([
  z.string().url(VALIDATION_MESSAGES.url),
  z
    .string()
    .regex(
      /^(?!https?:\/\/)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      VALIDATION_MESSAGES.url
    ),
]);

/**
 * Creates a phone number validation schema
 */
export const phoneSchema = z
  .string()
  .regex(
    /^\+?[\d\s-()]{10,}$/,
    'Please enter a valid phone number (e.g., +1234567890 or (123) 456-7890)'
  );

/**
 * Creates a date of birth validation schema
 * @param minAge Minimum age in years (default: 13)
 * @param maxAge Maximum age in years (default: 120)
 */
export const dateOfBirthSchema = (minAge = 13, maxAge = 120) => {
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - maxAge);
  
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - minAge);
  
  return z.date({
    required_error: 'Date of birth is required',
    invalid_type_error: 'Please enter a valid date',
  })
  .min(minDate, { message: `Must be at least ${minAge} years old` })
  .max(maxDate, { message: `Must be at most ${maxAge} years old` });
};

/**
 * Creates a file validation schema
 * @param options File validation options
 */
type FileValidationOptions = {
  maxSizeMB?: number;
  allowedTypes?: string[];
};

export const fileSchema = (options: FileValidationOptions = {}) => {
  const { maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'] } = options;
  
  return z
    .instanceof(File)
    .refine(
      (file) => file.size <= maxSizeMB * 1024 * 1024,
      `File size must be less than ${maxSizeMB}MB`
    )
    .refine(
      (file) => allowedTypes.includes(file.type),
      `File type must be one of: ${allowedTypes.join(', ')}`
    );
};

/**
 * Creates a validation schema for an array of values
 * @param schema Schema for each array item
 * @param options Array validation options
 */
type ArrayValidationOptions = {
  minLength?: number;
  maxLength?: number;
  unique?: boolean;
};

export const arraySchema = <T extends z.ZodTypeAny>(
  schema: T,
  options: ArrayValidationOptions = {}
) => {
  const { minLength = 0, maxLength, unique = false } = options;
  
  let arraySchema = z.array(schema);
  
  if (minLength > 0) {
    arraySchema = arraySchema.min(minLength, `Must have at least ${minLength} items`);
  }
  
  if (maxLength !== undefined) {
    arraySchema = arraySchema.max(maxLength, `Must have at most ${maxLength} items`);
  }
  
  if (unique) {
    arraySchema = arraySchema.refine(
      (items) => new Set(items).size === items.length,
      'All items must be unique'
    );
  }
  
  return arraySchema;
};

/**
 * Creates a validation schema for conditional fields
 * @param condition Condition to check
 * @param schema Schema to apply if condition is true
 * @param fallback Fallback value if condition is false (default: undefined)
 */
export const conditionalSchema = <T extends z.ZodTypeAny>(
  condition: (data: any) => boolean,
  schema: T,
  fallback: any = undefined
) => {
  return z.preprocess((data, ctx) => {
    return condition(ctx.parent) ? data : fallback;
  }, schema);
};
