import type { Meta, StoryObj } from '@storybook/react';
import { FadeIn } from './FadeIn';
import { StaggeredList } from './StaggeredList';
import { Button } from '../button/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../card/Card';

const meta: Meta = {
  title: 'Components/UI/Animations',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FadeInExample: Story = {
  render: () => (
    <div className="space-y-8">
      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle>Fade In Example</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This card fades in when it comes into view.</p>
          </CardContent>
        </Card>
      </FadeIn>

      <div className="grid gap-4 md:grid-cols-3">
        {[0, 0.2, 0.4].map((delay, index) => (
          <FadeIn key={index} delay={delay} yOffset={40}>
            <Card>
              <CardHeader>
                <CardTitle>Item {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Delayed by {delay}s</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>
    </div>
  ),
};

export const StaggeredListExample: Story = {
  render: () => (
    <div className="max-w-md mx-auto">
      <StaggeredList className="space-y-4">
        {['First', 'Second', 'Third', 'Fourth', 'Fifth'].map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{item} Item</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is the {item.toLowerCase()} item in the list.</p>
              <div className="mt-4">
                <Button variant="outline">Action {index + 1}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </StaggeredList>
    </div>
  ),
};

export const CombinedExample: Story = {
  render: () => (
    <FadeIn duration={0.8} yOffset={60}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Animated Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">This content fades in with an offset.</p>
          
          <StaggeredList className="space-y-4">
            {['Design', 'Develop', 'Deploy'].map((step, index) => (
              <Card key={step} className="border-l-4 border-primary">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {step} <span className="text-muted-foreground">Step {index + 1}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Details about the {step.toLowerCase()} process.</p>
                </CardContent>
              </Card>
            ))}
          </StaggeredList>
          
          <FadeIn delay={0.6} className="mt-8 flex justify-center">
            <Button>Get Started</Button>
          </FadeIn>
        </CardContent>
      </Card>
    </FadeIn>
  ),
};
