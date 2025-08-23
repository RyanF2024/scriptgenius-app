# Animation Components

This directory contains reusable animation components built with Framer Motion. These components provide consistent animations throughout the application.

## Components

### `FadeIn`
A wrapper component that fades in its children when they come into view.

#### Props
- `delay`: `number` (default: `0`) - Delay before the animation starts (in seconds)
- `duration`: `number` (default: `0.5`) - Duration of the animation (in seconds)
- `yOffset`: `number` (default: `20`) - Vertical offset for the animation start position
- `className`: `string` - Additional CSS classes
- All standard HTML div props are supported

#### Example
```tsx
<FadeIn delay={0.2} duration={0.8} yOffset={40}>
  <Card>
    <CardHeader>
      <CardTitle>Animated Card</CardTitle>
    </CardHeader>
    <CardContent>
      <p>This content will fade in when scrolled into view.</p>
    </CardContent>
  </Card>
</FadeIn>
```

### `StaggeredList`
A component that applies staggered animations to its children.

#### Props
- `staggerDelay`: `number` (default: `0.1`) - Delay between each child's animation (in seconds)
- `className`: `string` - Additional CSS classes
- All standard HTML div props are supported

#### Example
```tsx
<StaggeredList staggerDelay={0.15} className="space-y-4">
  {items.map((item) => (
    <Card key={item.id}>
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{item.description}</p>
      </CardContent>
    </Card>
  ))}
</StaggeredList>
```

## Best Practices

1. **Performance**:
   - Use `whileInView` for animations that should trigger when elements come into view
   - Set `once: true` for animations that should only play once
   - Use `margin` in viewport options to trigger animations before they're fully in view

2. **Accessibility**:
   - Respect reduced motion preferences using Framer Motion's built-in support
   - Ensure animations don't cause motion sickness or distraction
   - Provide alternative content for users who prefer reduced motion

3. **Consistency**:
   - Use consistent timing and easing functions
   - Keep animation durations between 200-500ms for UI interactions
   - Use spring physics for natural-feeling animations

## Adding New Animations

1. Create a new file in this directory for your animation component
2. Follow the same pattern as existing components
3. Add TypeScript types for all props
4. Document the component with JSDoc comments
5. Add a story to demonstrate the animation
6. Update this README if needed

## Dependencies

- `framer-motion`: ^10.0.0
- `react`: ^18.0.0
- `@types/react`: ^18.0.0
