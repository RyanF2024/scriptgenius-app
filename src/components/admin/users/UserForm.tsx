'use client';

import { User, UserRole } from '@prisma/client';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { EnhancedForm, FormField } from '@/components/ui/form/EnhancedForm';
import { FormLayout, FormSection, FormActions } from '@/components/ui/form/FormLayout';

// Define form schema with enhanced validations
const userFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  role: z.nativeEnum(UserRole, {
    required_error: 'Please select a role',
  }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'], {
    required_error: 'Please select a status',
  }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
  confirmPassword: z.string()
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => !(data.password || data.confirmPassword) || data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }
);

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: Partial<User>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { toast } = useToast();

  const handleSubmit = async (data: UserFormValues) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: user?.id ? 'User updated successfully' : 'User created successfully',
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
      throw error; // Let the form handle the error
    }
  };

  return (
    <EnhancedForm
      schema={userFormSchema}
      onSubmit={handleSubmit}
      defaultValues={{
        name: user?.name || '',
        email: user?.email || '',
        role: (user?.role as UserRole) || UserRole.USER,
        status: (user?.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') || 'ACTIVE',
        password: '',
        confirmPassword: '',
      }}
      submitText={user?.id ? 'Update User' : 'Create User'}
      showReset={false}
    >
      <FormLayout>
        <FormSection>
          <FormField
            name="name"
            label="Full Name"
            type="text"
            placeholder="John Doe"
            required
          />

          <FormField
            name="email"
            label="Email"
            type="email"
            placeholder="john@example.com"
            required
            disabled={!!user?.id}
          />

          <FormField
            name="role"
            label="Role"
            type="select"
            options={Object.values(UserRole).map((role) => ({
              value: role,
              label: role.charAt(0) + role.slice(1).toLowerCase(),
            }))}
            required
          />

          <FormField
            name="status"
            label="Status"
            type="select"
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'SUSPENDED', label: 'Suspended' },
            ]}
            required
          />

          {!user?.id && (
            <>
              <FormField
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                description="At least 8 characters, including letters and numbers"
                required
              />

              <FormField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                required
              />
            </>
          )}
        </FormSection>

        <FormActions>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </FormActions>
      </FormLayout>
    </EnhancedForm>
  );
}
