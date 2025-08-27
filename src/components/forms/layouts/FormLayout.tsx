import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type FormLayoutProps = {
  children: ReactNode;
  className?: string;
  /** Additional class names for the form content */
  contentClassName?: string;
  /** Whether to use a card style for the form */
  card?: boolean;
  /** Whether to add padding to the form */
  padded?: boolean;
};

/**
 * A layout component that provides consistent styling for forms.
 * Can be used as a container for form fields, sections, and actions.
 */
export function FormLayout({
  children,
  className,
  contentClassName,
  card = false,
  padded = true,
  ...props
}: FormLayoutProps) {
  return (
    <div
      className={cn(
        'space-y-6',
        {
          'rounded-lg border bg-card p-6 shadow-sm': card,
          'p-6': !card && padded,
        },
        className
      )}
      {...props}
    >
      <div className={cn('space-y-6', contentClassName)}>{children}</div>
    </div>
  );
}

type FormSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
};

/**
 * A section within a form that groups related fields together.
 * Includes an optional title and description.
 */
export function FormSection({
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
  contentClassName,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className={cn('text-lg font-medium leading-6', titleClassName)}>{title}</h3>
          )}
          {description && (
            <p className={cn('text-sm text-muted-foreground', descriptionClassName)}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn('space-y-4', contentClassName)}>{children}</div>
    </div>
  );
}

type FormActionsProps = {
  children: ReactNode;
  className?: string;
  /** Whether to show a divider above the actions */
  withDivider?: boolean;
  /** Whether to align the actions to the end (right) */
  alignEnd?: boolean;
};

/**
 * A container for form action buttons (submit, reset, etc.).
 * Provides consistent styling and layout for form actions.
 */
export function FormActions({
  children,
  className,
  withDivider = true,
  alignEnd = true,
}: FormActionsProps) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-3 sm:flex-row sm:justify-end', {
        'pt-6': withDivider,
        'border-t border-border': withDivider,
        'sm:justify-end': alignEnd,
        'sm:justify-start': !alignEnd,
      })}
    >
      {children}
    </div>
  );
}

/**
 * A grid layout for form fields.
 * Useful for laying out multiple fields in a responsive grid.
 */
type FormGridProps = {
  children: ReactNode;
  className?: string;
  /** Number of columns on small screens (default: 1) */
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Number of columns on medium screens (default: 2) */
  md?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Number of columns on large screens (default: 3) */
  lg?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Gap between grid items (default: '4') */
  gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20';
};

export function FormGrid({
  children,
  className,
  cols = 1,
  md = 2,
  lg = 3,
  gap = '4',
}: FormGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  const gridGap = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
    16: 'gap-16',
    20: 'gap-20',
  };

  return (
    <div
      className={cn(
        'grid',
        gridCols[cols],
        {
          [`md:${gridCols[md]}`]: md !== cols,
          [`lg:${gridCols[lg]}`]: lg !== md,
        },
        gridGap[gap],
        className
      )}
    >
      {children}
    </div>
  );
}
