import { useEffect, useRef } from 'react';

interface UseFormAccessibilityProps {
  /** The ID of the form element */
  formId: string;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Whether the form has validation errors */
  hasErrors?: boolean;
  /** Callback when form submission fails due to validation */
  onValidationFail?: () => void;
}

/**
 * A custom hook that enhances form accessibility by:
 * - Managing focus for better keyboard navigation
 * - Adding ARIA attributes for screen readers
 * - Handling form submission feedback
 */
export function useFormAccessibility({
  formId,
  isSubmitting = false,
  hasErrors = false,
  onValidationFail,
}: UseFormAccessibilityProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const firstErrorRef = useRef<HTMLElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Set ARIA attributes on mount
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    form.setAttribute('aria-label', 'Form');
    form.setAttribute('aria-busy', String(isSubmitting));

    if (hasErrors) {
      form.setAttribute('aria-invalid', 'true');
      form.setAttribute('aria-live', 'polite');
    } else {
      form.removeAttribute('aria-invalid');
      form.removeAttribute('aria-live');
    }

    return () => {
      form.removeAttribute('aria-busy');
      form.removeAttribute('aria-invalid');
      form.removeAttribute('aria-live');
    };
  }, [isSubmitting, hasErrors]);

  // Focus management for form submission feedback
  useEffect(() => {
    if (hasErrors && firstErrorRef.current) {
      // Focus the first error in the form
      firstErrorRef.current.focus();
      onValidationFail?.();
    } else if (!isSubmitting && !hasErrors && submitButtonRef.current) {
      // Return focus to submit button after successful submission
      submitButtonRef.current.focus();
    }
  }, [isSubmitting, hasErrors, onValidationFail]);

  /**
   * Handles form submission with accessibility considerations
   */
  const handleSubmit = async (
    e: React.FormEvent,
    onSubmit: (e: React.FormEvent) => Promise<void> | void
  ) => {
    e.preventDefault();
    
    // Set focus to the submit button for better keyboard navigation
    submitButtonRef.current?.focus();
    
    try {
      await onSubmit(e);
    } catch (error) {
      // Error handling is managed by the form component
      console.error('Form submission error:', error);
    }
  };

  /**
   * Registers a form field with the accessibility manager
   */
  const registerField = (fieldId: string, hasError: boolean) => {
    return {
      id: fieldId,
      'aria-required': true,
      'aria-invalid': hasError || undefined,
      'aria-describedby': hasError ? `${fieldId}-error` : undefined,
      ref: (node: HTMLElement | null) => {
        if (hasError && node && !firstErrorRef.current) {
          firstErrorRef.current = node;
        }
      },
    };
  };

  return {
    formRef,
    submitButtonRef,
    registerField,
    handleSubmit,
  };
}

export default useFormAccessibility;
