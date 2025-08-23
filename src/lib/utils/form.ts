import { type FieldError, type FieldErrors } from 'react-hook-form';

export function getErrorByPath(
  errors: FieldErrors,
  path: string
): FieldError | undefined {
  return path.split('.').reduce((errObj, key) => {
    if (errObj && typeof errObj === 'object' && key in errObj) {
      return errObj[key as keyof typeof errObj];
    }
    return undefined;
  }, errors as any);
}

export function getErrorMessage(error?: FieldError): string | null {
  if (!error) return null;
  
  if (error.message) {
    return error.message.toString();
  }
  
  switch (error.type) {
    case 'required':
      return 'This field is required';
    case 'minLength':
      return `Must be at least ${error.type === 'minLength' ? error.requiredLength : 0} characters`;
    case 'maxLength':
      return `Must be less than ${error.type === 'maxLength' ? error.requiredLength : 0} characters`;
    case 'pattern':
      return 'Invalid format';
    case 'validate':
      return 'Validation failed';
    default:
      return 'Invalid value';
  }
}

export function formatFormErrors(errors: FieldErrors): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  Object.entries(errors).forEach(([key, error]) => {
    if (error && typeof error === 'object' && 'message' in error) {
      formattedErrors[key] = getErrorMessage(error as FieldError) || 'Invalid value';
    }
  });
  
  return formattedErrors;
}
