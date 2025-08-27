import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { UserForm } from '@/components/admin/users/UserForm';
import { UserRole } from '@prisma/client';
import userEvent from '@testing-library/user-event';

describe('UserForm', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.ADMIN,
    status: 'ACTIVE',
  };

  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with default values for new user', () => {
    render(<UserForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText('Full Name')).toHaveValue('');
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Role')).toHaveTextContent('Select an option');
    expect(screen.getByLabelText('Status')).toHaveTextContent('Select an option');
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('pre-fills the form when editing an existing user', () => {
    render(
      <UserForm user={mockUser} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    expect(screen.getByLabelText('Full Name')).toHaveValue('John Doe');
    expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Role')).toHaveTextContent('Admin');
    expect(screen.getByLabelText('Status')).toHaveTextContent('Active');
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Confirm Password')).not.toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<UserForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Create User' }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Please select a role')).toBeInTheDocument();
      expect(screen.getByText('Please select a status')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<UserForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('validates password confirmation', async () => {
    render(<UserForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });
    fireEvent.blur(confirmPasswordInput);

    await waitFor(() => {
      expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    render(<UserForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Fill in the form
    await userEvent.type(screen.getByLabelText('Full Name'), 'Jane Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    
    // Select role
    fireEvent.mouseDown(screen.getByLabelText('Role'));
    fireEvent.click(screen.getByText('User'));
    
    // Select status
    fireEvent.mouseDown(screen.getByLabelText('Status'));
    fireEvent.click(screen.getByText('Active'));
    
    // Fill in passwords
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'password123');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create User' }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<UserForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
