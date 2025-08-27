import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FormLayoutProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footer?: ReactNode;
  footerClassName?: string;
};

export function FormLayout({
  children,
  title,
  description,
  className,
  headerClassName,
  contentClassName,
  footer,
  footerClassName,
}: FormLayoutProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {(title || description) && (
        <div className={cn('space-y-2', headerClassName)}>
          {title && (
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <div className={cn('space-y-4', contentClassName)}>{children}</div>

      {footer && (
        <div
          className={cn(
            'flex items-center justify-end gap-4 pt-4',
            footerClassName
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

type FormSectionProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  contentClassName?: string;
};

export function FormSection({
  children,
  title,
  description,
  className,
  contentClassName,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-4 rounded-lg border p-6', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className={cn('space-y-4', contentClassName)}>{children}</div>
    </div>
  );
}

type FormGridProps = {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

export function FormGrid({
  children,
  className,
  columns = 2,
  gap = 'md',
}: FormGridProps) {
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  return (
    <div
      className={cn(
        'grid',
        gridCols[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

type FormActionsProps = {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
};

export function FormActions({
  children,
  className,
  align = 'end',
}: FormActionsProps) {
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4',
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
}
