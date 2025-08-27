import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters long')
  .max(50, 'Name must be less than 50 characters');

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

export const phoneSchema = z
  .string()
  .regex(
    /^\+?[\d\s-()]{10,}$/,
    'Please enter a valid phone number'
  )
  .optional()
  .or(z.literal(''));

export const dateSchema = z
  .string()
  .or(z.date())
  .refine(
    (val) => {
      if (!val) return true;
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: 'Please enter a valid date' }
  );

export const fileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File size must be less than 5MB'
  )
  .optional();

export const imageSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'Image size must be less than 5MB'
  )
  .refine(
    (file) => file.type.startsWith('image/'),
    'File must be an image'
  )
  .optional();

export const checkboxSchema = z.boolean().refine((val) => val === true, {
  message: 'This field must be checked',
});

export const selectSchema = z.string().min(1, 'Please select an option');

export const arrayMinLength = (min: number) => (val: unknown[]) =>
  val.length >= min || { message: `Please select at least ${min} option(s)` };

export const arrayMaxLength = (max: number) => (val: unknown[]) =>
  val.length <= max || { message: `Please select at most ${max} option(s)` };

export const conditionalValidation = <T>(
  condition: boolean,
  schema: z.ZodType<T>,
  message?: string
) => {
  return z.union([
    z.string().length(0),
    schema.refine(() => condition, {
      message: message || 'This field is required',
    }),
  ]);
};

export const createFormSchema = <T extends z.ZodRawShape>(schema: T) => {
  return z.object(schema);
};

export const validateFormData = async <T extends z.ZodType>(
  schema: T,
  formData: FormData
): Promise<{ data?: z.infer<T>; errors?: Record<string, string> }> => {
  try {
    const data = Object.fromEntries(formData.entries());
    const result = await schema.safeParseAsync(data);

    if (!result.success) {
      const errors = result.error.issues.reduce<Record<string, string>>(
        (acc, issue) => {
          const path = issue.path.join('.');
          acc[path] = issue.message;
          return acc;
        },
        {}
      );
      return { errors };
    }

    return { data: result.data };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      errors: {
        form: 'An error occurred while validating the form',
      },
    };
  }
};
