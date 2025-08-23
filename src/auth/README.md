# Authentication System

This document outlines the new authentication system architecture and how to use it in your application.

## Architecture

The authentication system is split into several key components:

1. **AuthContext**: Manages authentication state (user, session, loading, errors)
2. **UserProfileContext**: Manages user profile data
3. **authService**: Handles all Supabase authentication logic
4. **useAuth hooks**: Custom hooks for common authentication patterns
5. **ErrorBoundary**: Handles errors in the auth flow

## Setup

Wrap your application with the providers in your root layout:

```tsx
// app/layout.tsx
import { AuthAndProfileProvider } from '@/contexts/UserProfileContext';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          <AuthAndProfileProvider>
            {children}
          </AuthAndProfileProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

## Usage

### Basic Authentication

```tsx
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const { signIn, signInWithOAuth, isLoading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    // Handle error if needed
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </form>
  );
}
```

### Protected Routes

```tsx
import { useRequireAuth } from '@/hooks/useAuth';

function Dashboard() {
  const { user, profile, isLoading } = useRequireAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {profile?.full_name || user?.email}</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### Profile Management

```tsx
import { useUserProfile } from '@/contexts/UserProfileContext';

function ProfilePage() {
  const { profile, updateProfile, isLoading } = useUserProfile();
  
  const handleSave = async (updates) => {
    try {
      await updateProfile(updates);
      // Show success message
    } catch (error) {
      // Handle error
    }
  };

  // Render profile form
}
```

## Error Handling

Errors are handled at multiple levels:

1. **Service Level**: `authService` throws errors
2. **Context Level**: Contexts manage error state
3. **Component Level**: Components can handle or display errors
4. **Global Level**: `ErrorBoundary` catches unhandled errors

## Best Practices

1. Use the provided hooks instead of accessing contexts directly
2. Always handle loading states
3. Use error boundaries for route-level error handling
4. Keep authentication logic in the `authService`
5. Use the `useRequireAuth` hook for protected routes

## API Reference

### `useAuth()`

Returns:
- `user`: The current user object
- `session`: The current session
- `isLoading`: Loading state
- `error`: Any error that occurred
- `signIn(email, password)`: Sign in with email/password
- `signUp(email, password, fullName)`: Create a new account
- `signInWithOAuth(provider)`: Sign in with OAuth provider
- `signOut()`: Sign out the current user
- `resetPassword(email)`: Send password reset email
- `updatePassword(newPassword)`: Update user password
- `refreshSession()`: Refresh the current session

### `useUserProfile()`

Returns:
- `profile`: The user's profile data
- `isLoading`: Loading state
- `error`: Any error that occurred
- `updateProfile(updates)`: Update the user's profile
- `refreshProfile()`: Refresh the profile data

### `useRequireAuth(redirectUrl)`

Redirects to `redirectUrl` if user is not authenticated.

### `useRequireProfile(redirectUrl)`

Redirects to `redirectUrl` if user is authenticated but has no profile.

### `useRedirectIfAuthenticated(redirectUrl)`

Redirects to `redirectUrl` if user is already authenticated.
