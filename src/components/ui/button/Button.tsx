import { forwardRef } from 'react';
import type { ReactNode, ElementType } from 'react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import type { HTMLMotionProps, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
        ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        link: 'underline-offset-4 hover:underline text-primary hover:no-underline',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md text-xs',
        lg: 'h-11 px-8 rounded-md text-base',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'md',
    },
  }
);

type ButtonElement = HTMLButtonElement | HTMLAnchorElement;

export interface ButtonProps
  extends Omit<MotionProps, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'style'>,
    VariantProps<typeof buttonVariants> {
  /** Display a loading spinner and disable the button */
  isLoading?: boolean;
  /** Render as a different element type */
  as?: ElementType;
  /** Make the button take the full width of its container */
  fullWidth?: boolean;
  /** Additional class names to apply */
  className?: string;
  /** Button content */
  children?: ReactNode;
  /** Show loading text while loading */
  loadingText?: string;
  /** Icon to display before the button text */
  leftIcon?: ReactNode;
  /** Icon to display after the button text */
  rightIcon?: ReactNode;
  /** Disable the button */
  disabled?: boolean;
  /** Callback when clicked */
  onClick?: (event: React.MouseEvent<ButtonElement>) => void;
  /** Custom component to render the loading spinner */
  spinner?: ReactNode;
  /** Custom props for the loading spinner */
  spinnerProps?: React.HTMLAttributes<HTMLOrSVGElement>;
  /** Custom class for the loading spinner */
  spinnerClassName?: string;
  /** Custom class for the loading text */
  loadingTextClassName?: string;
  /** Custom class for the left icon */
  leftIconClassName?: string;
  /** Custom class for the right icon */
  rightIconClassName?: string;
}

const Button = forwardRef<ButtonElement, ButtonProps>((
  {
    as: Component = motion.button,
    className,
    variant,
    size,
    isLoading = false,
    loadingText,
    children,
    leftIcon,
    rightIcon,
    spinner: customSpinner,
    spinnerProps,
    spinnerClassName,
    loadingTextClassName,
    leftIconClassName,
    rightIconClassName,
    fullWidth,
    disabled,
    whileHover = { scale: 1.03 },
    whileTap = { scale: 0.98 },
    transition = { type: 'spring', stiffness: 400, damping: 17 },
    ...props
  },
  ref
) => {
  const spinner = customSpinner || (
    <Loader2
      className={cn('animate-spin h-4 w-4 text-current', spinnerClassName)}
      {...spinnerProps}
    />
  );

  const content = (
    <>
      {isLoading && (
        <span className="inline-flex items-center justify-center">
          {spinner}
          {loadingText && (
            <span className={cn('ml-2', loadingTextClassName)}>
              {loadingText}
            </span>
          )}
        </span>
      )}
      {!isLoading && (
        <>
          {leftIcon && (
            <span className={cn('inline-flex', leftIconClassName)}>
              {leftIcon}
            </span>
          )}
          <span>{children}</span>
          {rightIcon && (
            <span className={cn('inline-flex', rightIconClassName)}>
              {rightIcon}
            </span>
          )}
        </>
      )}
    </>
  );

  return (
    <Component
      ref={ref as any}
      className={cn(
        buttonVariants({
          variant,
          size,
          fullWidth,
          className,
        }),
        'relative overflow-hidden',
        className
      )}
      disabled={isLoading || disabled}
      whileHover={!isLoading ? whileHover : undefined}
      whileTap={!isLoading ? whileTap : undefined}
      transition={transition}
      {...props}
    >
      {content}
      {!isLoading && (
        <motion.span
          className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      )}
    </Component>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };

export type { ButtonProps };
