import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
  },
  args: {
    placeholder: 'Enter text here',
    disabled: false,
    error: false,
    errorMessage: 'This field is required',
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Default Input',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Input with description',
    description: 'This is a helpful description',
  },
};

export const WithError: Story = {
  args: {
    label: 'Input with error',
    error: true,
    errorMessage: 'This field is required',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    disabled: true,
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
  },
};

export const Email: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'name@example.com',
  },
};
