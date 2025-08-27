import { render, screen, fireEvent, waitFor } from '../test-utils';
import { EnhancedForm, FormField } from '@/components/ui/form/EnhancedForm';
import { z } from 'zod';
import { Button } from '@/components/ui/button';

// Test schema
const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'You must be at least 18 years old'),
  agree: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
});

type TestFormData = z.infer<typeof testSchema>;

describe('EnhancedForm', () => {
  const mockSubmit = jest.fn();
  
  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it('renders form with fields', () => {
    render(
      <EnhancedForm
        schema={testSchema}
        onSubmit={mockSubmit}
        defaultValues={{
          name: '',
          email: '',
          age: 0,
          agree: false,
        }}
      >
        <FormField name="name" label="Name" />
        <FormField name="email" label="Email" type="email" />
        <FormField name="age" label="Age" type="number" />
        <FormField name="agree" label="I agree to the terms" type="checkbox" />
      </EnhancedForm>
    );

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toBeInTheDocument();
    expect(screen.getByLabelText('I agree to the terms')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    render(
      <EnhancedForm
        schema={testSchema}
        onSubmit={mockSubmit}
        defaultValues={{
          name: '',
          email: '',
          age: 0,
          agree: false,
        }}
      >
        <FormField name="name" label="Name" />
        <FormField name="email" label="Email" type="email" />
        <FormField name="age" label="Age" type="number" />
        <FormField name="agree" label="I agree to the terms" type="checkbox" />
      </EnhancedForm>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      expect(
        screen.getByText('You must be at least 18 years old')
      ).toBeInTheDocument();
      expect(screen.getByText('You must agree to the terms')).toBeInTheDocument();
    });

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with form data when validation passes', async () => {
    const testData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
      agree: true,
    };

    render(
      <EnhancedForm
        schema={testSchema}
        onSubmit={mockSubmit}
        defaultValues={{
          name: '',
          email: '',
          age: 0,
          agree: false,
        }}
      >
        <FormField name="name" label="Name" />
        <FormField name="email" label="Email" type="email" />
        <FormField name="age" label="Age" type="number" />
        <FormField name="agree" label="I agree to the terms" type="checkbox" />
      </EnhancedForm>
    );

    fireEvent.input(screen.getByLabelText('Name'), {
      target: { value: testData.name },
    });

    fireEvent.input(screen.getByLabelText('Email'), {
      target: { value: testData.email },
    });

    fireEvent.input(screen.getByLabelText('Age'), {
      target: { value: testData.age },
    });

    fireEvent.click(screen.getByLabelText('I agree to the terms'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(testData, expect.anything());
    });
  });

  it('shows loading state when submitting', async () => {
    let resolveSubmit: (value?: any) => void;
    const promise = new Promise((resolve) => {
      resolveSubmit = resolve;
    });

    const handleSubmit = jest.fn(() => promise);

    render(
      <EnhancedForm
        schema={testSchema}
        onSubmit={handleSubmit}
        defaultValues={{
          name: 'John Doe',
          email: 'john@example.com',
          age: 25,
          agree: true,
        }}
      >
        <FormField name="name" label="Name" />
        <Button type="submit">Save</Button>
      </EnhancedForm>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    });

    // Resolve the promise to complete the test
    resolveSubmit!();
    await promise;
  });

  it('handles form reset', async () => {
    const initialValues = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
      agree: true,
    };

    render(
      <EnhancedForm
        schema={testSchema}
        onSubmit={mockSubmit}
        defaultValues={initialValues}
        showReset
      >
        <FormField name="name" label="Name" />
        <FormField name="email" label="Email" type="email" />
      </EnhancedForm>
    );

    // Change the name field
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    expect(nameInput).toHaveValue('Jane Doe');

    // Click the reset button
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    // The form should be reset to initial values
    expect(nameInput).toHaveValue(initialValues.name);
  });

  it('disables submit button when form is invalid', () => {
    render(
      <EnhancedForm
        schema={testSchema}
        onSubmit={mockSubmit}
        defaultValues={{
          name: '',
          email: '',
          age: 0,
          agree: false,
        }}
      >
        <FormField name="name" label="Name" />
        <Button type="submit">Save</Button>
      </EnhancedForm>
    );

    // Initially, the form is invalid, so the button should be disabled
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});
