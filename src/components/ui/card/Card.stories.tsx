import type { Meta, StoryObj } from '@storybook/react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from '../button/Button';
import { fadeIn, slideUp } from '@/lib/animations';

export default {
  title: 'Components/UI/Card',
  component: Card,
  subcomponents: { CardHeader, CardTitle, CardDescription, CardContent, CardFooter },
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof Card>;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="w-full" {...args}>
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
          <CardDescription>With subtle hover effect</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Hover over this card to see a subtle elevation effect.
          </p>
        </CardContent>
      </Card>

      <Card 
        className="w-full" 
        hoverEffect="scale"
        clickEffect="scale"
        {...args}
      >
        <CardHeader>
          <CardTitle>Interactive Card</CardTitle>
          <CardDescription>With scale on hover and click</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Hover to scale up, click to scale down.
          </p>
        </CardContent>
      </Card>

      <Card 
        className="w-full" 
        hoverEffect="elevate"
        animation="slide"
        {...args}
      >
        <CardHeader>
          <CardTitle>Animated Entry</CardTitle>
          <CardDescription>Slides in when in view</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This card slides up when it comes into view.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const WithImage: Story = {
  render: (args) => (
    <div className="grid gap-6 md:grid-cols-2">
      <Card 
        className="w-full overflow-hidden" 
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.3 }
        }}
        {...args}
      >
        <motion.div 
          className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span 
              className="text-white font-bold text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Hover to Zoom
            </motion.span>
          </div>
        </motion.div>
        <CardHeader>
          <CardTitle>Featured Content</CardTitle>
          <CardDescription>With interactive image</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Hover over the image to see a zoom effect.
          </p>
        </CardContent>
      </Card>

      <Card 
        className="w-full overflow-hidden"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-20%' }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-48 bg-gradient-to-r from-green-400 to-blue-500" />
        <CardHeader>
          <CardTitle>Animated Entry</CardTitle>
          <CardDescription>Slides in from the right</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This card slides in when it comes into viewport.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const AnimatedStats: Story = {
  render: (args) => (
    <div className="grid gap-4 md:grid-cols-3">
      <Card 
        className="p-6 text-center" 
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        {...args}
      >
        <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          <AnimatedNumber value={42} />
        </CardTitle>
        <CardDescription className="text-sm">Active Users</CardDescription>
      </Card>

      <Card 
        className="p-6 text-center"
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        {...args}
      >
        <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent">
          <AnimatedNumber value={98} />%
        </CardTitle>
        <CardDescription className="text-sm">Satisfaction</CardDescription>
      </Card>

      <Card 
        className="p-6 text-center"
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        {...args}
      >
        <CardTitle className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
          <AnimatedNumber value={24} />/7
        </CardTitle>
        <CardDescription className="text-sm">Support</CardDescription>
      </Card>
    </div>
  ),
};

// Helper component for animated numbers
const AnimatedNumber = ({ value }: { value: number }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {value}
    </motion.span>
  );
};

export const AnimatedList: Story = {
  render: (args) => {
    const items = [
      { id: 1, title: 'Project Update', time: '2 hours ago', status: 'completed' },
      { id: 2, title: 'Team Meeting', time: '5 hours ago', status: 'pending' },
      { id: 3, title: 'Code Review', time: '1 day ago', status: 'in-progress' },
    ];

    return (
      <Card className="w-full max-w-md" {...args}>
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates</CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="space-y-4"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    },
                  },
                }}
                whileHover={{ x: 5 }}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.status === 'completed' ? 'View' : 'Action'}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
        <CardFooter>
          <motion.div 
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button variant="ghost" className="w-full">
              View All Activity
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    );
  },
};
