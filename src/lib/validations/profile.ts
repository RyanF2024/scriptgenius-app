import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(100, { message: 'Name must be less than 100 characters.' })
    .optional()
    .or(z.literal('')),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters.' })
    .max(30, { message: 'Username must be less than 30 characters.' })
    .regex(/^[a-zA-Z0-9_.-]+$/, {
      message: 'Username can only contain letters, numbers, periods, underscores, and hyphens.',
    })
    .optional()
    .or(z.literal('')),
  website: z.union([
    z.string().url({ message: 'Please enter a valid URL.' }),
    z.literal('').optional()
  ]),
  bio: z
    .string()
    .max(500, { message: 'Bio must be less than 500 characters.' })
    .optional()
    .or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
