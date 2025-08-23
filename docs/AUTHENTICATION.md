# Authentication and Toast System

## Table of Contents
- [Toast System](#toast-system)
  - [Usage](#toast-usage)
  - [API Reference](#toast-api)
  - [Customization](#toast-customization)
- [Authentication](#authentication)
  - [Auth Context](#auth-context)
  - [Common Patterns](#common-patterns)
  - [Error Handling](#error-handling)
  - [Protected Routes](#protected-routes)

## Toast System

Our application uses a custom toast notification system built with React hooks and context.

### Usage

#### Basic Usage

```tsx
import { useToast } from '@/components/ui/use-toast';

function MyComponent() {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: 'Success!',
      description: 'Your action was completed successfully.',
      variant: 'success',
      duration: 5000, // Optional, defaults to 5000ms
    });
  };

  return <button onClick={handleClick}>Show Toast</button>;
}
```

#### Convenience Methods

```tsx
const { success, error, warning, info } = useToast();

// Success toast
success('Success!', 'Operation completed successfully');

// Error toast
error('Error', 'Something went wrong');

// Warning toast
warning('Warning', 'This action cannot be undone');

// Info toast
info('Info', 'Your profile has been updated');
```

### API Reference

#### `useToast()`

Returns an object with the following properties:

- `toast(options: ToastOptions)`: Shows a toast with the given options
- `success(title: string, description?: string, duration?: number)`: Shows a success toast
- `error(title: string, description?: string, duration?: number)`: Shows an error toast
- `warning(title: string, description?: string, duration?: number)`: Shows a warning toast
- `info(title: string, description?: string, duration?: number)`: Shows an info toast

#### `ToastOptions`

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| title | string | Yes | - | The title of the toast |
| description | string | No | - | The description of the toast |
| variant | 'default' \| 'success' \| 'error' \| 'warning' \| 'info' | No | 'default' | The variant of the toast |
| duration | number | No | 5000 | Duration in milliseconds before the toast auto-dismisses |

### Customization

To customize the appearance of toasts, you can modify the `Toast` component in `components/ui/toast.tsx`.

## Authentication

### Auth Context

The `AuthContext` provides authentication state and methods throughout your application.

#### Setup

Wrap your application with the `AuthProvider` in your root layout:

```tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Common Patterns

#### Sign In with Email/Password

```tsx
import { useAuth } from '@/contexts/AuthContext';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Signed in successfully',
        variant: 'success',
      });
      
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

#### Sign Up with Email/Password

```tsx
const { signUp } = useAuth();

const handleSignUp = async (email: string, password: string, userData: UserData) => {
  try {
    const { error } = await signUp(email, password, userData);
    if (error) throw error;
    
    toast({
      title: 'Success',
      description: 'Account created! Please check your email to verify your account.',
      variant: 'success',
    });
    
    router.push('/verify-email');
  } catch (error) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to create account',
      variant: 'error',
    });
  }
};
```

#### OAuth Sign In

```tsx
const { signInWithOAuth } = useAuth();

const handleOAuthSignIn = async (provider: 'google' | 'github') => {
  try {
    const { error } = await signInWithOAuth(provider);
    if (error) throw error;
    
    // User will be redirected automatically
  } catch (error) {
    toast({
      title: 'Error',
      description: `Failed to sign in with ${provider}`,
      variant: 'error',
    });
  }
};
```

#### Password Reset

```tsx
const { sendPasswordResetEmail } = useAuth();

const handleResetPassword = async (email: string) => {
  try {
    const { error } = await sendPasswordResetEmail(email);
    if (error) throw error;
    
    toast({
      title: 'Email Sent',
      description: 'Check your email for a password reset link',
      variant: 'success',
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to send password reset email',
      variant: 'error',
    });
  }
};
```

### Error Handling

All auth methods return an object with an `error` property. Handle errors like this:

```tsx
const { error } = await signIn(email, password);
if (error) {
  // Handle error
  console.error(error);
  return;
}
// Proceed with success case
```

### Protected Routes

Use the `useRequireAuth` hook to protect routes:

```tsx
import { useRequireAuth } from '@/hooks/use-auth';

function ProtectedPage() {
  const { user, isLoading } = useRequireAuth('/login');
  
  if (isLoading || !user) {
    return <LoadingSpinner />;
  }
  
  return <div>Protected content</div>;
}
```

Or create a higher-order component:

```tsx
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function withAuth(Component: React.ComponentType) {
  return function ProtectedRoute(props: any) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/login');
      }
    }, [isLoading, user, router]);

    if (isLoading || !user) {
      return <LoadingSpinner />;
    }

    return <Component {...props} />;
  };
}

// Usage
const ProtectedDashboard = withAuth(Dashboard);
```
