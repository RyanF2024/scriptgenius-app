import * as React from 'react';
import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeIn, scaleUp } from '@/lib/animations';

// Type definitions
export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'style'> {
  hoverEffect?: 'scale' | 'elevate' | 'none';
  clickEffect?: 'scale' | 'elevate' | 'none';
  animation?: 'fade' | 'slide' | 'none';
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    hoverEffect = 'elevate',
    clickEffect = 'scale',
    animation = 'fade',
    ...props
  }, ref) => {
    const hoverVariants = {
      scale: { scale: 1.02 },
      elevate: { y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' },
      none: {}
    };

    const tapVariants = {
      scale: { scale: 0.98 },
      elevate: { y: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' },
      none: {}
    };

    const animationVariants = {
      fade: fadeIn,
      slide: {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
        }
      },
      none: {}
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-lg border bg-card text-card-foreground shadow-sm',
          'transition-all duration-200 ease-in-out',
          className
        )}
        initial={animation !== 'none' ? 'hidden' : false}
        whileInView={animation !== 'none' ? 'visible' : false}
        viewport={{ once: true, margin: '-20%' }}
        variants={animation !== 'none' ? animationVariants[animation] : undefined}
        whileHover={hoverEffect !== 'none' ? hoverVariants[hoverEffect] : undefined}
        whileTap={clickEffect !== 'none' ? tapVariants[clickEffect] : undefined}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 20,
          ...props.transition
        }}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    variants={{
      hidden: { opacity: 0, y: 10 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.3, ease: 'easeOut' }
      }
    }}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <motion.h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    variants={{
      hidden: { opacity: 0, y: 5 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.3, delay: 0.1, ease: 'easeOut' }
      }
    }}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <motion.p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    variants={{
      hidden: { opacity: 0, y: 5 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.3, delay: 0.15, ease: 'easeOut' }
      }
    }}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <motion.div 
    ref={ref} 
    className={cn('p-6 pt-0', className)} 
    variants={{
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { 
          staggerChildren: 0.1,
          when: 'beforeChildren'
        }
      }
    }}
    {...props} 
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    variants={{
      hidden: { opacity: 0, y: 10 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.3, ease: 'easeOut' }
      }
    }}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
