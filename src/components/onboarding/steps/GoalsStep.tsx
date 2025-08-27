import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OnboardingLayout } from '../OnboardingLayout';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { goalsSchema, type GoalsInput } from '@/lib/validations/onboarding';
import { Form } from '@/components/ui/form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

const GOALS = [
  { id: 'improve-dialogue', label: 'Improve dialogue quality' },
  { id: 'better-structure', label: 'Enhance story structure' },
  { id: 'character-dev', label: 'Develop stronger characters' },
  { id: 'formatting', label: 'Learn proper script formatting' },
  { id: 'productivity', label: 'Increase writing productivity' },
  { id: 'feedback', label: 'Get feedback on my scripts' },
  { id: 'pitch', label: 'Create better pitch materials' },
  { id: 'collaborate', label: 'Collaborate with other writers' },
] as const;

export const GoalsStep: React.FC = () => {
  const { data, updateData, onNext } = useOnboarding();

  const form = useForm<GoalsInput>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      goals: data.goals || [],
      customGoal: '',
      receiveTips: data.receiveTips ?? true,
      subscribeNewsletter: data.subscribeNewsletter ?? true,
    },
  });

  const { control, handleSubmit, watch, setValue } = form;
  const selectedGoals = watch('goals') || [];
  const customGoal = watch('customGoal') || '';

  const onSubmit = (values: GoalsInput) => {
    // Add custom goal if provided and not empty
    const allGoals = [...values.goals];
    if (values.customGoal?.trim() && !allGoals.includes(values.customGoal)) {
      allGoals.push(values.customGoal);
    }
    
    updateData({
      goals: allGoals,
      receiveTips: values.receiveTips,
      subscribeNewsletter: values.subscribeNewsletter,
    });
    
    onNext();
  };

  return (
    <OnboardingLayout
      canProceed={form.formState.isValid}
      onNext={handleSubmit(onSubmit)}
      nextButtonText="Complete Setup"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Your Writing Goals</h2>
          <p className="text-muted-foreground">
            Let us know what you want to achieve with ScriptGenius.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What are your main writing goals?</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {GOALS.map((goal) => (
                      <div key={goal.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`goal-${goal.id}`}
                          checked={field.value?.includes(goal.id)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...(field.value || []), goal.id]
                              : field.value?.filter((id) => id !== goal.id) || [];
                            field.onChange(newValue);
                            updateData({ goals: newValue });
                          }}
                        />
                        <label
                          htmlFor={`goal-${goal.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {goal.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="customGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Or add your own goal (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="I want to..."
                      rows={2}
                      onChange={(e) => {
                        field.onChange(e);
                        updateData({ customGoal: e.target.value });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-4 border-t">
              <FormField
                control={control}
                name="receiveTips"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          updateData({ receiveTips: checked as boolean });
                        }}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Send me writing tips and resources
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="subscribeNewsletter"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          updateData({ subscribeNewsletter: checked as boolean });
                        }}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Subscribe to our newsletter for updates and resources
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>
    </OnboardingLayout>
  );
};
