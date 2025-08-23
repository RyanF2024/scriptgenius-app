import type { Meta, StoryObj } from '@storybook/react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Download, Zap, ArrowRight, Check, Sun, Moon } from 'lucide-react';
import { fadeIn, slideUp } from '@/lib/animations';
import { useDarkMode } from 'storybook-dark-mode';

const meta: Meta<typeof Button> = {
  title: 'Components/UI/Button',
  component: Button,
  tags: ['autodocs', 'autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The variant of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    isLoading: {
      control: 'boolean',
      description: 'Show loading state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    onClick: { action: 'clicked' },
  },
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
    disabled: false,
    isLoading: false,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `A customizable button component with multiple variants and states.\n\n### When to use\n- To trigger an action or event, such as submitting a form, opening a dialog, or navigating.\n- To indicate the primary action in a form or modal.\n- To provide visual feedback for user interactions.`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * The default button component with all the basic functionality.
 * Use this as the base for all button interactions.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The default button with primary styling. Use for primary actions.',
      },
    },
  },
};

/**
 * All available button variants in one place for easy comparison.
 */
export const Variants: Story = {
  render: () => (
    <motion.div 
      className="grid grid-cols-1 gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      <motion.div variants={fadeIn} className="space-y-4">
        <h3 className="text-lg font-medium">Primary Variants</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </motion.div>
      
      <motion.div variants={fadeIn} className="space-y-4">
        <h3 className="text-lg font-medium">Secondary Variants</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </motion.div>
      
      <motion.div variants={fadeIn} className="space-y-4">
        <h3 className="text-lg font-medium">Sizes</h3>
        <div className="flex items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon"><Sun className="h-4 w-4" /></Button>
        </div>
      </motion.div>
    </motion.div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants and sizes for different use cases.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  ),
};

/**
 * Buttons with icons for better visual hierarchy and user experience.
 */
export const WithIcon: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Buttons can include icons to provide better visual cues for their actions.',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button {...args}>
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      <Button variant="outline" size="sm">
        <Zap className="mr-2 h-3.5 w-3.5" />
        Quick Action
      </Button>
      <Button variant="ghost" size="sm">
        View Details
        <ArrowRight className="ml-2 h-3.5 w-3.5" />
      </Button>
      <Button variant="link" className="gap-2">
        Learn More
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  ),
};

/**
 * An interactive button example with various animations and states.
 */
export const Interactive: Story = {
  render: (args) => {
    const isDark = useDarkMode();
    return (
      <motion.div
        className="flex flex-col items-center gap-8 p-8 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">Click the button below to explore the possibilities</p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              {...args}
              className="relative overflow-hidden group"
              onClick={() => console.log('Button clicked!')}
            >
              <span className="relative z-10 flex items-center">
                <Zap className="mr-2 h-4 w-4" />
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
            </Button>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          {['default', 'destructive', 'outline', 'secondary'].map((variant) => (
            <motion.div
              key={variant}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <Button 
                variant={variant as any}
                className="w-full justify-center"
                onClick={() => console.log(`${variant} clicked!`)}
              >
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </Button>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm text-muted-foreground mb-4">Toggle theme to see how buttons adapt</p>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const event = new CustomEvent('theme:toggle');
              window.dispatchEvent(event);
            }}
            className="rounded-full"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
      </motion.div>
    );
  },
  args: {
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'An interactive example showing button animations and theme toggling. Hover, click, and try the theme toggle to see different states.',
      },
    },
  },
};

/**
 * Buttons with icons for better visual hierarchy and user experience.
 */
export const WithIcon: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Buttons can include icons to provide better visual cues for their actions.',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button {...args}>
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      <Button variant="outline" size="sm">
        <Zap className="mr-2 h-3.5 w-3.5" />
        Quick Action
      </Button>
      <Button variant="ghost" size="sm">
        View Details
        <ArrowRight className="ml-2 h-3.5 w-3.5" />
      </Button>
      <Button variant="link" className="gap-2">
        Learn More
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  ),
};

/**
 * Success animation on button click.
 */
export const SuccessAnimation: Story = {
  args: {
    children: 'Submit',
    variant: 'default',
    whileHover: { 
      scale: 1.02,
      backgroundColor: '#10B981', // Success green
    },
    whileTap: { 
      scale: 0.98,
    },
    transition: { 
      backgroundColor: { duration: 0.2 },
      scale: { type: 'spring', stiffness: 400, damping: 17 }
    },
    onHoverEnd: (e: any) => {
      e.target.style.backgroundColor = ''; // Reset on hover end
    },
    icon: <Check className="mr-2 h-4 w-4" />
  },
};

/**
 * Button with all variants and sizes.
 */
export const AllVariantsAndSizes: Story = {
  render: () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
    const sizes = ['sm', 'default', 'lg', 'icon'] as const;
    
    return (
      <div className="space-y-8">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <h3 className="text-sm font-medium">{variant.charAt(0).toUpperCase() + variant.slice(1)}</h3>
            <div className="flex flex-wrap items-center gap-2">
              {sizes.map((size) => (
                <Button
                  key={`${variant}-${size}`}
                  variant={variant}
                  size={size}
                  className="capitalize"
                >
                  {size === 'icon' ? (
                    <Search className="h-4 w-4" />
                  ) : (
                    size
                  )}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'All button variants and sizes for easy reference.',
      },
    },
  },
};

/**
 * Button with hover animation.
 */
export const WithHoverAnimation: Story = {
  args: {
    children: 'Hover Me',
    variant: 'default',
    whileHover: { 
      scale: 1.05,
      boxShadow: '0 0 15px rgba(0,0,0,0.1)',
    },
    transition: { type: 'spring', stiffness: 400, damping: 10 }
  },
};

/**
 * Button with tap animation.
 */
export const WithTapAnimation: Story = {
  args: {
    children: 'Tap Me',
    variant: 'secondary',
    whileTap: { 
      scale: 0.95,
      rotate: '-5deg',
    },
    transition: { type: 'spring', stiffness: 500, damping: 15 }
  },
};

/**
 * Animated on view.
 */
export const AnimatedOnView: Story = {
  render: (args) => (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
      className="space-y-4"
    >
      <Button {...args} variants={slideUp} custom={0.1}>
        <Zap className="mr-2 h-4 w-4" />
        Appears on scroll
      </Button>
      <Button {...args} variants={slideUp} custom={0.2} variant="outline">
        <ArrowRight className="mr-2 h-4 w-4" />
        Staggered animation
      </Button>
    </motion.div>
  ),
  args: {
    variant: 'default',
  },
};
  },
};

/**
 * Buttons in loading state with different variants.
 */
export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
