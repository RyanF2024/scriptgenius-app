# AuthContext

A comprehensive authentication context for managing user sessions, authentication state, and protected routes in Next.js applications.

## Features

- **Session Management** - Automatic token refresh and session persistence
- **Authentication Methods** - Email/password, OAuth, magic links
- **Protected Routes** - HOC for route protection
- **Error Handling** - Graceful error boundaries and error states
- **Loading States** - Per-operation loading indicators
- **Type Safety** - Full TypeScript support

## Installation

No additional installation is required as this is part of the application's core.

## Usage

### Basic Usage

Wrap your application with the `AuthProvider`:

```tsx
// app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Using the Hook

Access auth state and methods in your components:

```tsx
import { useAuth } from '@/contexts/AuthContext';

function UserProfile() {
  const { user, signIn, signOut, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <button onClick={() => signIn('user@example.com', 'password')}>
        Sign In
      </button>
    );
  }

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Protected Routes

Use the `withAuth` HOC to protect routes:

```tsx
// app/dashboard/page.tsx
import { withAuth } from '@/contexts/AuthContext';

function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>This is a protected route</p>
    </div>
  );
}

export default withAuth(DashboardPage, {
  redirectTo: '/login', // Optional: Redirect to this path if not authenticated
});
```

## API Reference

### AuthProvider Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `React.ReactNode` | Your application content |

### useAuth() Return Value

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User | null` | The current user object or null if not authenticated |
| `session` | `Session | null` | The current session object |
| `isLoading` | `boolean` | Global loading state |
| `loadingStates` | `Record<AuthOperation, boolean>` | Loading states for individual operations |
| `error` | `AuthError | null` | The current error, if any |
| `lastActivity` | `number | null` | Timestamp of last user activity |
| `isSessionAboutToExpire` | `boolean` | Whether the session is about to expire |
| `signIn` | `(email: string, password: string) => Promise<...>` | Sign in with email and password |
| `signUp` | `(email: string, password: string, userData?: Partial<Profile>) => Promise<...>` | Create a new account |
| `signOut` | `() => Promise<...>` | Sign out the current user |
| `signInWithOAuth` | `(provider: 'google' | 'github') => Promise<...>` | Sign in with OAuth provider |
| `sendPasswordResetEmail` | `(email: string) => Promise<...>` | Send a password reset email |
| `updatePassword` | `(newPassword: string) => Promise<...>` | Update the user's password |
| `refreshSession` | `() => Promise<...>` | Manually refresh the session |
| `clearError` | `() => void` | Clear the current error |

### withAuth(Component, options?)

A higher-order component that protects routes from unauthenticated access.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `redirectTo` | `string` | `'/login'` | Path to redirect to if not authenticated |

## Error Handling

The `AuthErrorBoundary` component is used to catch and display authentication-related errors:

```tsx
import { AuthErrorBoundary } from '@/contexts/AuthContext';

function App() {
  return (
    <AuthErrorBoundary>
      {/* Your app content */}
    </AuthErrorBoundary>
  );
}
```

## Session Management

The context automatically handles:

- Session refresh before expiration
- Token refresh with exponential backoff
- Activity tracking
- Cleanup on unmount

## Testing

Tests are located in `src/__tests__/contexts/AuthContext.test.tsx`.

To run the tests:

```bash
npm test AuthContext
```

## Best Practices

1. **Use the `useAuth` hook** instead of directly accessing the context
2. **Check loading states** before rendering protected content
3. **Handle errors** using the error state or error boundary
4. **Use `withAuth`** for route protection
5. **Implement proper error boundaries** to catch and display errors gracefully

## License

MIT
