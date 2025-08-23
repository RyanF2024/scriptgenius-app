import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

export const slideUp: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { 
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: { 
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const scaleUp: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: { 
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const staggerContainer = (staggerChildren: number = 0.1): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren: 0.1,
    },
  },
});

// Common animation props for reuse
export const animationProps = {
  initial: 'hidden',
  animate: 'visible',
  exit: 'exit',
  variants: {},
  transition: { duration: 0.3 },
};
