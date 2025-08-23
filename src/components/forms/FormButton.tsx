import { Button, type ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type FormButtonProps = {
  isLoading?: boolean;
  loadingText?: string;
} & ButtonProps;

export function FormButton({
  children,
  isLoading = false,
  loadingText = 'Saving...',
  disabled = false,
  className,
  ...props
}: FormButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled || isLoading}
      className={className}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
