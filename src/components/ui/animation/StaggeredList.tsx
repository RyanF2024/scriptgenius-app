import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggeredListProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggeredList = ({
  children,
  staggerDelay = 0.1,
  className = '',
  ...props
}: StaggeredListProps) => {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        when: 'beforeChildren',
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-20%' }}
      className={className}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div variants={item} key={index}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StaggeredList;
