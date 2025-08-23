import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OnboardingLayout } from '../OnboardingLayout';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Checkbox } from '@/components/ui/checkbox';
import { GENRES, EXPERIENCE_LEVELS } from '@/lib/constants';
import { preferencesSchema, type PreferencesInput } from '@/lib/validations/onboarding';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const PreferencesStep: React.FC = () => {
  const { data, updateData, onNext } = useOnboarding();

  const form = useForm<PreferencesInput>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      genres: data.genres || [],
      experience: data.experience || 'beginner',
    },
  });

  const { control, handleSubmit, watch } = form;
  const selectedGenres = watch('genres') || [];
  const maxGenres = 5;

  const onSubmit = (values: PreferencesInput) => {
    updateData(values);
    onNext();
  };

  return (
    <OnboardingLayout
      canProceed={form.formState.isValid}
      onNext={handleSubmit(onSubmit)}
      nextButtonText="Continue"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Your Preferences</h2>
          <p className="text-muted-foreground">
            Help us tailor ScriptGenius to your writing style and experience level.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={control}
              name="genres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What genres do you typically write in?</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {GENRES.map((genre) => (
                      <div key={genre} className="flex items-center space-x-2">
                        <Checkbox
                          id={`genre-${genre}`}
                          checked={field.value?.includes(genre)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...(field.value || []), genre].slice(0, maxGenres)
                              : field.value?.filter((g) => g !== genre) || [];
                            field.onChange(newValue);
                            updateData({ genres: newValue });
                          }}
                          disabled={
                            !field.value?.includes(genre) && field.value?.length >= maxGenres
                          }
                        />
                        <label
                          htmlFor={`genre-${genre}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {genre}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormDescription>
                    {selectedGenres.length > 0
                      ? `Selected ${selectedGenres.length} of ${maxGenres} genres`
                      : 'Select up to 5 genres'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your screenwriting experience level</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      updateData({ experience: value });
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </OnboardingLayout>
  );
};
