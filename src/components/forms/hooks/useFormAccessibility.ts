import { useEffect, useRef, useState } from 'react';
import { useFormContext, type FieldError } from 'react-hook-form';
import { useDebounce } from 'use-debounce';

/**
 * Hook that provides accessibility features for form fields
 * @param fieldName The name of the field to enhance
 * @param options Configuration options
 */
export function useFormAccessibility<TFieldName extends string>(
  fieldName: TFieldName,
  options: {
    /** Whether the field is required */
    required?: boolean;
    /** Custom error message to display */
    errorMessage?: string | ((error: FieldError) => string);
    /** Whether to announce errors to screen readers */
    announceErrors?: boolean;
    /** Debounce time for error announcements in ms */
    debounceTime?: number;
  } = {}
) {
  const {
    formState: { errors, isSubmitting, isSubmitted, touchedFields },
  } = useFormContext();
  
  const fieldError = errors[fieldName] as FieldError | undefined;
  const isTouched = touchedFields[fieldName];
  const fieldRef = useRef<HTMLDivElement>(null);
  const [announcedError, setAnnouncedError] = useState<string | null>(null);
  const [debouncedError] = useDebounce(
    fieldError?.message,
    options.debounceTime ?? 300
  );

  // Handle error announcements
  useEffect(() => {
    if (!options.announceErrors) return;
    
    const errorToAnnounce = options.errorMessage
      ? typeof options.errorMessage === 'function'
        ? options.errorMessage(fieldError as FieldError)
        : options.errorMessage
      : fieldError?.message;

    if (errorToAnnounce && errorToAnnounce !== announcedError) {
      setAnnouncedError(errorToAnnounce);
      
      // Create and announce the error
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('role', 'alert');
      liveRegion.setAttribute('aria-live', 'assertive');
      liveRegion.style.position = 'absolute';
      liveRegion.style.clip = 'rect(0 0 0 0)';
      liveRegion.style.clipPath = 'inset(50%)';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      liveRegion.style.whiteSpace = 'nowrap';
      liveRegion.style.width = '1px';
      
      liveRegion.textContent = errorToAnnounce;
      document.body.appendChild(liveRegion);
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(liveRegion);
      }, 1000);
    }
  }, [debouncedError, options.announceErrors, options.errorMessage, announcedError, fieldError]);

  // Focus the first invalid field on form submission
  useEffect(() => {
    if (isSubmitted && fieldError && !isTouched) {
      fieldRef.current?.focus();
    }
  }, [isSubmitted, fieldError, isTouched]);

  // Generate ARIA attributes
  const getAriaAttributes = (fieldProps: Record<string, any> = {}) => {
    const ariaProps: Record<string, any> = {
      'aria-invalid': !!fieldError,
      'aria-required': options.required,
      ...fieldProps,
    };

    if (fieldError) {
      ariaProps['aria-describedby'] = [
        fieldProps['aria-describedby'],
        `${fieldName}-error`,
      ]
        .filter(Boolean)
        .join(' ');
    }

    return ariaProps;
  };

  // Generate error props
  const getErrorProps = () => {
    if (!fieldError) return {};

    return {
      'id': `${fieldName}-error`,
      'role': 'alert',
      'aria-live': 'assertive',
    };
  };

  return {
    /** Reference to the field container */
    fieldRef,
    /** Whether the field has an error */
    hasError: !!fieldError,
    /** Error message if any */
    errorMessage: fieldError?.message,
    /** Whether the field is currently being submitted */
    isSubmitting,
    /** Whether the form has been submitted */
    isSubmitted,
    /** Whether the field has been touched */
    isTouched: !!isTouched,
    /** Whether the field is required */
    isRequired: !!options.required,
    /** Whether the field is disabled (based on form submission state) */
    isDisabled: isSubmitting,
    /** Whether the field is read-only (based on form submission state) */
    isReadOnly: isSubmitting,
    /** ARIA attributes for the form field */
    getAriaAttributes,
    /** Props for the error message element */
    getErrorProps,
  };
}

/**
 * Hook that manages focus for form fields with errors
 * @param fieldNames Array of field names to track
 */
export function useFormFocusManagement(fieldNames: string[]) {
  const {
    formState: { errors, isSubmitted },
  } = useFormContext();
  const hasFocused = useRef(false);

  useEffect(() => {
    if (isSubmitted && !hasFocused.current) {
      // Find the first field with an error
      const firstErrorField = fieldNames.find((fieldName) => errors[fieldName]);
      
      if (firstErrorField) {
        const errorElement = document.querySelector(
          `[name="${firstErrorField}"], [data-name="${firstErrorField}"]`
        ) as HTMLElement;
        
        if (errorElement) {
          errorElement.focus({ preventScroll: true });
          hasFocused.current = true;
        }
      }
    }
  }, [isSubmitted, errors, fieldNames]);

  return null;
}

/**
 * Hook that provides form-level accessibility features
 * @param options Configuration options
 */
export function useFormA11y(options: {
  /** ID of the form element */
  formId?: string;
  /** Whether to announce form submission status */
  announceSubmitStatus?: boolean;
} = {}) {
  const {
    formState: { isSubmitting, isSubmitSuccessful, isSubmitted, errors },
  } = useFormContext();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Announce form submission status
  useEffect(() => {
    if (!options.announceSubmitStatus) return;

    if (isSubmitting) {
      setStatusMessage('Submitting form...');
    } else if (isSubmitted) {
      if (isSubmitSuccessful) {
        setStatusMessage('Form submitted successfully!');
      } else if (Object.keys(errors).length > 0) {
        setStatusMessage(
          `Form submission failed. Please check the ${Object.keys(errors).length} error(s) in the form.`
        );
      }
    }

    // Clear the status message after a delay
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isSubmitting, isSubmitted, isSubmitSuccessful, errors, options.announceSubmitStatus, statusMessage]);

  // Focus the status element when it changes
  useEffect(() => {
    if (statusMessage && statusRef.current) {
      statusRef.current.focus();
    }
  }, [statusMessage]);

  return {
    /** Props for the status container */
    getStatusProps: () => ({
      ref: statusRef,
      role: 'status',
      'aria-live': 'polite',
      tabIndex: -1,
      className: 'sr-only',
    }),
    /** The current status message */
    statusMessage,
  };
}
