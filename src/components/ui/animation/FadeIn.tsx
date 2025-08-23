import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeInProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
}

export const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  yOffset = 20,
  className = '',
  ...props
}: FadeInProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20%' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
