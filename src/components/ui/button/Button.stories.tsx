import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Download, Zap, Check, Sun, Moon } from 'lucide-react';
import { within, userEvent } from '@storybook/test';
import { expect } from '@storybook/test';
import { fn } from '@storybook/test';

const meta: Meta<typeof Button> = {
  title: 'Components/UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A highly customizable button component with multiple variants, sizes, and states.

### Features
- **Variants**: default, destructive, outline, secondary, ghost, link
- **Sizes**: sm, default, lg, icon
- **States**: loading, disabled
- **Full-width** support
- **Icon** support
- **Dark mode** compatible

### When to Use
- Triggering actions (forms, dialogs, navigation)
- Primary actions in forms/modals
- Interactive elements requiring visual feedback

### Usage
\`\`\`tsx
import { Button } from '@/components/ui/button/Button';

// Basic usage
<Button>Click me</Button>

// With variant and icon
<Button variant="destructive">
  <Trash className="mr-2 h-4 w-4" />
  Delete
</Button>
\`\`\`
        `,
      },
    },
  },
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
    onClick: { 
      action: 'clicked',
      description: 'Click handler',
    },
  },
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
    disabled: false,
    isLoading: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * Default button with all basic states
 */
export const Default: Story = {
  args: {
    children: 'Click me',
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    // Test click interaction
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

/**
 * All available button variants
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    </div>
  ),
};

/**
 * Different button sizes
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon"><Sun className="h-4 w-4" /></Button>
    </div>
  ),
};

/**
 * Buttons with icons
 */
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button>
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      <Button variant="outline">
        <Zap className="mr-2 h-4 w-4" />
        Get Started
      </Button>
    </div>
  ),
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Loading...',
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
};

/**
 * Full width button for forms and important actions
 */
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    className: 'w-full',
  },
  parameters: {
    layout: 'padded',
  },
};

/**
 * Interactive example with click handler
 */
export const Interactive: Story = {
  args: {
    children: 'Click me',
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    // Test click interaction
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};
