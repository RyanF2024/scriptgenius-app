import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OnboardingLayout } from '../OnboardingLayout';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { USER_ROLES } from '@/lib/constants';
import { profileSchema, type ProfileInput } from '@/lib/validations/onboarding';
import { Form } from '@/components/ui/form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export const ProfileStep: React.FC = () => {
  const { data, updateData, onNext } = useOnboarding();

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: data.fullName || '',
      displayName: data.displayName || '',
      role: (data.role as 'writer' | 'producer' | 'director' | 'student' | 'other') || 'writer',
    },
  });

  const onSubmit = (values: ProfileInput) => {
    updateData(values);
    onNext();
  };

  return (
    <OnboardingLayout
      canProceed={form.formState.isValid}
      onNext={form.handleSubmit(onSubmit)}
      nextButtonText="Continue"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Tell us about yourself</h2>
          <p className="text-muted-foreground">
            We'll use this information to personalize your ScriptGenius experience.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          updateData({ fullName: e.target.value });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="johndoe"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          updateData({ displayName: e.target.value });
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground mt-1">
                      This is how you'll appear to other users.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>I am a</FormLabel>
                    <div className="space-y-2">
                      {USER_ROLES.map((role) => (
                        <div key={role.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={role.value}
                            checked={field.value === role.value}
                            onChange={() => {
                              field.onChange(role.value);
                              updateData({ role: role.value });
                            }}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                          />
                          <label
                            htmlFor={role.value}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {role.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </OnboardingLayout>
  );
};
