import { z } from 'zod';
import { GENRES, EXPERIENCE_LEVELS } from '@/lib/constants';

// Base schema with common fields
export const baseOnboardingSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  role: z.enum(['writer', 'producer', 'director', 'student', 'other']),
  genres: z
    .array(z.string())
    .min(1, 'Select at least one genre')
    .max(5, 'You can select up to 5 genres'),
  experience: z.enum([
    'beginner',
    'intermediate',
    'advanced',
    'professional',
  ] as const),
  goals: z.array(z.string()).min(1, 'Select at least one goal'),
  receiveTips: z.boolean().default(true),
  subscribeNewsletter: z.boolean().default(true),
});

// Step-specific schemas
export const profileSchema = baseOnboardingSchema.pick({
  fullName: true,
  displayName: true,
  role: true,
});

export const preferencesSchema = baseOnboardingSchema.pick({
  genres: true,
  experience: true,
});

export const goalsSchema = baseOnboardingSchema.pick({
  goals: true,
  receiveTips: true,
  subscribeNewsletter: true,
});

// Type exports
export type OnboardingInput = z.infer<typeof baseOnboardingSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type GoalsInput = z.infer<typeof goalsSchema>;

// Validation functions
export const validateProfile = (data: unknown) =>
  profileSchema.safeParse(data);

export const validatePreferences = (data: unknown) =>
  preferencesSchema.safeParse(data);

export const validateGoals = (data: unknown) =>
  goalsSchema.safeParse(data);

// Helper function to get field error
export const getFieldError = (errors: z.ZodIssue[], field: string) => {
  return errors.find((err) => err.path.includes(field))?.message;
};
