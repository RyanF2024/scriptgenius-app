# Form Components Examples

This document provides examples of how to use the new form components in your application.

## Basic Form Example

```tsx
import { Form, InputField, Button } from '@/components/forms';
import { z } from 'zod';

// Define your form schema using Zod
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const handleSubmit = async (data: LoginFormData) => {
    console.log('Form submitted:', data);
  };

  return (
    <Form<LoginFormData>
      schema={loginSchema}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {({ register, formState: { errors } }) => (
        <>
          <InputField
            label="Email"
            type="email"
            error={errors.email}
            {...register('email')}
          />
          
          <InputField
            label="Password"
            type="password"
            error={errors.password}
            {...register('password')}
          />
          
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              {...register('rememberMe')}
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900"
            >
              Remember me
            </label>
          </div>
          
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </>
      )}
    </Form>
  );
}
```

## Form with Layout Components

```tsx
import { Form, FormSection, FormActions, FormGrid } from '@/components/forms';
import { InputField, Button } from '@/components/forms';
import { z } from 'zod';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const handleSubmit = async (data: ProfileFormData) => {
    console.log('Form submitted:', data);
  };

  return (
    <Form<ProfileFormData>
      schema={profileSchema}
      onSubmit={handleSubmit}
    >
      {({ register, formState: { errors, isSubmitting } }) => (
        <div className="space-y-6">
          <FormSection 
            title="Personal Information"
            description="Update your personal details"
          >
            <FormGrid cols={2} gap={4}>
              <InputField
                label="First Name"
                error={errors.firstName}
                {...register('firstName')}
              />
              
              <InputField
                label="Last Name"
                error={errors.lastName}
                {...register('lastName')}
              />
              
              <InputField
                label="Email"
                type="email"
                error={errors.email}
                {...register('email')}
              />
              
              <InputField
                label="Phone"
                type="tel"
                error={errors.phone}
                {...register('phone')}
              />
            </FormGrid>
          </FormSection>
          
          <FormActions>
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save Changes
            </Button>
          </FormActions>
        </div>
      )}
    </Form>
  );
}
```

## Form with Dynamic Fields

```tsx
import { useState } from 'react';
import { Form, InputField, Button } from '@/components/forms';
import { z } from 'zod';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const educationSchema = z.object({
  education: z.array(
    z.object({
      school: z.string().min(1, 'School name is required'),
      degree: z.string().min(1, 'Degree is required'),
      year: z.string().regex(/^\d{4}$/, 'Enter a valid year'),
    })
  ).min(1, 'At least one education entry is required'),
});

type EducationFormData = z.infer<typeof educationSchema>;

export function EducationForm() {
  const handleSubmit = async (data: EducationFormData) => {
    console.log('Form submitted:', data);
  };

  return (
    <Form<EducationFormData>
      schema={educationSchema}
      onSubmit={handleSubmit}
      defaultValues={{
        education: [{ school: '', degree: '', year: '' }],
      }}
    >
      {({ register, formState: { errors }, watch, setValue }) => {
        const educationFields = watch('education') || [];
        
        return (
          <div className="space-y-4">
            {educationFields.map((_, index) => (
              <div key={index} className="border p-4 rounded-lg relative">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newEducation = [...educationFields];
                      newEducation.splice(index, 1);
                      setValue('education', newEducation);
                    }}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
                
                <h3 className="font-medium mb-4">Education {index + 1}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    label="School/Institution"
                    error={errors.education?.[index]?.school}
                    {...register(`education.${index}.school`)}
                  />
                  
                  <InputField
                    label="Degree"
                    error={errors.education?.[index]?.degree}
                    {...register(`education.${index}.degree`)}
                  />
                  
                  <InputField
                    label="Graduation Year"
                    error={errors.education?.[index]?.year}
                    {...register(`education.${index}.year`)}
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => {
                setValue('education', [
                  ...educationFields,
                  { school: '', degree: '', year: '' },
                ]);
              }}
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800"
            >
              <PlusIcon className="mr-1 h-4 w-4" />
              Add Education
            </button>
            
            <div className="pt-4">
              <Button type="submit">
                Save Education
              </Button>
            </div>
          </div>
        );
      }}
    </Form>
  );
}
```

## Form with Conditional Fields

```tsx
import { Form, SelectField, InputField, Button } from '@/components/forms';
import { z } from 'zod';

const paymentSchema = z.object({
  paymentMethod: z.enum(['credit_card', 'paypal']),
  cardNumber: z.string().optional(),
  paypalEmail: z.string().email().optional(),
}).refine(
  (data) => {
    if (data.paymentMethod === 'credit_card') {
      return data.cardNumber && data.cardNumber.length === 16;
    }
    if (data.paymentMethod === 'paypal') {
      return !!data.paypalEmail;
    }
    return true;
  },
  {
    message: 'Please fill in all required fields',
    path: ['paymentMethod'],
  }
);

type PaymentFormData = z.infer<typeof paymentSchema>;

export function PaymentForm() {
  const handleSubmit = async (data: PaymentFormData) => {
    console.log('Form submitted:', data);
  };

  return (
    <Form<PaymentFormData>
      schema={paymentSchema}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {({ register, watch, formState: { errors } }) => {
        const paymentMethod = watch('paymentMethod');
        
        return (
          <>
            <SelectField
              label="Payment Method"
              options={[
                { value: 'credit_card', label: 'Credit Card' },
                { value: 'paypal', label: 'PayPal' },
              ]}
              error={errors.paymentMethod}
              {...register('paymentMethod')}
            />
            
            {paymentMethod === 'credit_card' && (
              <InputField
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                error={errors.cardNumber}
                {...register('cardNumber')}
              />
            )}
            
            {paymentMethod === 'paypal' && (
              <InputField
                label="PayPal Email"
                type="email"
                placeholder="your@email.com"
                error={errors.paypalEmail}
                {...register('paypalEmail')}
              />
            )}
            
            <Button type="submit" className="w-full">
              Submit Payment
            </Button>
          </>
        );
      }}
    </Form>
  );
}
```

## Form with File Upload

```tsx
import { Form, Button } from '@/components/forms';
import { z } from 'zod';

const fileSchema = z.custom<FileList>()
  .refine((files) => files.length > 0, 'File is required')
  .refine(
    (files) => files[0]?.size <= 5 * 1024 * 1024,
    'File size must be less than 5MB'
  );

const uploadSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  file: fileSchema,
});

type UploadFormData = z.infer<typeof uploadSchema>;

export function FileUploadForm() {
  const handleSubmit = async (data: UploadFormData) => {
    const formData = new FormData();
    formData.append('file', data.file[0]);
    formData.append('title', data.title);
    
    console.log('Uploading file:', formData);
  };

  return (
    <Form<UploadFormData>
      schema={uploadSchema}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {({ register, formState: { errors } }) => (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 p-2"
              {...register('title')}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File
            </label>
            <input
              type="file"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100"
              {...register('file')}
            />
            {errors.file && (
              <p className="mt-1 text-sm text-red-600">
                {errors.file.message as string}
              </p>
            )}
          </div>
          
          <Button type="submit">
            Upload File
          </Button>
        </>
      )}
    </Form>
  );
}
```

These examples demonstrate the flexibility and power of the new form components. You can combine these patterns to create complex forms with validation, conditional fields, and dynamic behavior.
