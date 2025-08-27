# Form Components

A comprehensive form system built with React Hook Form, Zod validation, and TypeScript. This system provides a type-safe, accessible, and performant way to build complex forms with minimal boilerplate.

## Features

- 🚀 **Type-safe** forms with TypeScript
- 🔍 **Built-in validation** with Zod
- ♿ **Accessible** by default
- 🎨 **Consistent styling** with Tailwind CSS
- ⚡ **Optimized performance** with controlled re-renders
- 🧩 **Composable** components and hooks
- 📱 **Responsive** layouts

## Structure

```
forms/
├── components/       # Core form components
│   ├── fields/       # Form field components
│   └── layouts/      # Layout components
├── hooks/            # Custom hooks for form management
│   ├── useFormAccessibility.ts
│   ├── useOptimizedForm.ts
│   └── useOptimizedFormSubmit.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── utils/            # Utility functions
│   ├── fieldUtils.ts
│   └── validation.ts
└── validations/      # Validation schemas and utilities
    ├── validators.ts
    └── schema.ts
```

## Core Components

### Form

The main form component that handles form state, validation, and submission.

```tsx
<Form
  schema={formSchema}
  onSubmit={handleSubmit}
  defaultValues={initialData}
  className="space-y-4"
>
</Form>
```

### Form Fields

| Component | Description |
|-----------|-------------|
| `InputField` | Text, email, password, number, etc. |
| `TextareaField` | Multi-line text input |
| `SelectField` | Dropdown selection |
| `CheckboxField` | Single checkbox |
| `RadioGroupField` | Radio button group |
| `SwitchField` | Toggle switch |
| `SliderField` | Range slider |
| `DatePickerField` | Date selection |
| `FileUploadField` | File upload with preview |

### Layout Components

| Component | Description |
|-----------|-------------|
| `FormLayout` | Base layout container |
| `FormSection` | Group related fields |
| `FormActions` | Container for form buttons |
| `FormGrid` | Responsive grid layout |
| `FieldGroup` | Group related fields visually |

## Getting Started

### Installation

```bash
npm install @hookform/resolvers zod react-hook-form
```

### Basic Usage

```tsx
import { Form, InputField, Button } from '@/components/forms';
import { z } from 'zod';

// Define your form schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
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
          
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </>
      )}
    </Form>
  );
}
```

## Advanced Usage

### Form with Layout

```tsx
<Form<FormData> schema={schema} onSubmit={onSubmit}>
  <FormSection title="Personal Information">
    <FormGrid cols={2}>
      <InputField label="First Name" {...register('firstName')} />
      <InputField label="Last Name" {...register('lastName')} />
    </FormGrid>
  </FormSection>
  
  <FormActions>
    <Button type="button" variant="outline">Cancel</Button>
    <Button type="submit">Save Changes</Button>
  </FormActions>
</Form>
```

### Dynamic Fields

```tsx
// Add/remove fields dynamically
const { fields, append, remove } = useFieldArray({
  control,
  name: 'education',
});

// In your form:
{fields.map((field, index) => (
  <div key={field.id}>
    <InputField
      label="School"
      {...register(`education.${index}.school`)}
    />
    <button type="button" onClick={() => remove(index)}>
      Remove
    </button>
  </div>
))}

<button 
  type="button" 
  onClick={() => append({ school: '', degree: '' })}
>
  Add Education
</button>
```

## Validation

### Built-in Validators

```typescript
import { z } from 'zod';
import { 
  passwordSchema, 
  emailSchema, 
  urlSchema, 
  dateSchema 
} from '@/components/forms/validations';

// Basic validation
const basicSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: emailSchema(),
  age: z.number().min(18, 'Must be 18 or older'),
});

// Password with custom requirements
const passwordFormSchema = z.object({
  password: passwordSchema({
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecialChar: true,
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

### Custom Validation

```typescript
const uniqueUsername = async (username: string) => {
  // Simulate API call
  const available = await checkUsernameAvailability(username);
  return available || 'Username is already taken';
};

const signupSchema = z.object({
  username: z.string().min(3).refine(uniqueUsername, {
    message: 'Please choose a different username',
  }),
});
```

## Accessibility

All form components are built with accessibility in mind:

- Proper ARIA attributes
- Keyboard navigation
- Screen reader support
- Error announcements
- Focus management

### Accessibility Features

1. **Error Messages**
   - Linked to fields with `aria-describedby`
   - Announced to screen readers when they appear

2. **Required Fields**
   - Marked with `aria-required`
   - Visually indicated with an asterisk

3. **Form Submission**
   - Loading and success/error states
   - Status announcements

4. **Field Instructions**
   - Help text with `aria-describedby`
   - Visible labels for all fields

## Best Practices

### Component Structure

1. **Separation of Concerns**
   - Keep form logic separate from presentation
   - Use custom hooks for complex form logic
   - Reuse common field components

2. **Performance**
   - Memoize expensive calculations
   - Use `shouldUnregister: false` for better UX
   - Implement code splitting for large forms

3. **Error Handling**
   - Show field-level errors
   - Display form-level errors
   - Handle API errors gracefully

4. **UX**
   - Show loading states during submission
   - Provide clear success/error feedback
   - Disable submit button while submitting

## Testing

### Unit Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('validates required fields', async () => {
    render(<LoginForm />);
    
    // Test validation
    userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check for validation errors
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });
  
  it('submits valid data', async () => {
    const handleSubmit = jest.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    // Fill out form
    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check submission
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

### Integration Testing

```typescript
describe('UserProfileForm', () => {
  it('updates user profile', async () => {
    // Mock API
    const mockUpdate = jest.fn().mockResolvedValue({ success: true });
    
    render(
      <UserContext.Provider value={{ updateProfile: mockUpdate }}>
        <UserProfileForm />
      </UserContext.Provider>
    );
    
    // Fill and submit form
    userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    
    // Verify API call
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        name: 'John Doe',
      });
    });
    
    // Check for success message
    expect(await screen.findByText('Profile updated')).toBeInTheDocument();
  });
});
```

## Examples

See the [EXAMPLES.md](./EXAMPLES.md) file for complete examples of different form patterns and use cases.

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation
4. Open a pull request
