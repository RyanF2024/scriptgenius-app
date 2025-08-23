'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>An unexpected error occurred. Please try again later.</p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-2 text-sm text-muted-foreground">
                  <summary className="cursor-pointer font-medium">Error details</summary>
                  <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                    {this.state.error?.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <div className="mt-4">
                <Button variant="outline" onClick={this.handleReset}>
                  Try again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for using the error boundary in function components
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  ErrorBoundaryComponent: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }> = DefaultErrorBoundary
) {
  return function ErrorBounded(props: T) {
    const [error, setError] = React.useState<Error | null>(null);

    const resetError = () => setError(null);

    if (error) {
      return <ErrorBoundaryComponent error={error} resetErrorBoundary={resetError} />;
    }

    return (
      <ErrorBoundary
        onError={(error: Error) => setError(error)}
        fallback={
          <ErrorBoundaryComponent error={error!} resetErrorBoundary={resetError} />
        }
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Default error boundary component that can be used with withErrorBoundary
const DefaultErrorBoundary = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex min-h-screen flex-col items-center justify-center p-4">
    <Alert variant="destructive" className="max-w-lg">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>An error occurred: {error.message}</p>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  </div>
);

// Global error boundary for Next.js error boundary
// This will be used in _error.tsx or _app.tsx
export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              <p>An unexpected error occurred. Please refresh the page or try again later.</p>
            </AlertDescription>
          </Alert>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
