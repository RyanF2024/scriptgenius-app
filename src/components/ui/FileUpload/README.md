# FileUpload Component

A highly customizable and accessible file upload component with drag-and-drop support, file validation, and preview capabilities.

## Features

- **Drag & Drop** - Intuitive file upload with visual feedback
- **File Validation** - Type and size restrictions
- **Preview Support** - Image previews and file type icons
- **Progress Tracking** - Visual upload progress
- **Responsive** - Works on all screen sizes
- **Accessible** - Keyboard navigable and screen reader friendly

## Installation

```bash
# If using pnpm
pnpm add @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react

# If using npm
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react

# If using yarn
yarn add @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
```

## Usage

```tsx
import { FileUpload } from '@/components/ui/FileUpload';

function Example() {
  const handleUpload = async (files: File[]) => {
    // Handle file upload here
    console.log('Uploading files:', files);
    
    // Example: Upload to an API
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error; // This will be caught by the component
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Files</h1>
      <FileUpload 
        onUpload={handleUpload}
        maxSize={10 * 1024 * 1024} // 10MB
        accept="image/*,.pdf,.doc,.docx"
        maxFiles={5}
        buttonText="Select Files"
        className="border-2 border-dashed p-6 rounded-lg"
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUpload` | `(files: File[]) => Promise<void> | void` | **Required** | Callback when files are selected and upload is triggered |
| `maxSize` | `number` | `5 * 1024 * 1024` (5MB) | Maximum file size in bytes |
| `accept` | `string` | `image/*,.pdf,.doc,.docx,.txt` | Accepted file types (MIME types or extensions) |
| `maxFiles` | `number` | `1` | Maximum number of files allowed |
| `showPreview` | `boolean` | `true` for images, `false` otherwise | Whether to show file previews |
| `buttonText` | `string` | `'Choose files'` | Text for the upload button |
| `className` | `string` | `''` | Additional CSS class names |

## Styling

The component uses Tailwind CSS for styling. You can customize the appearance by:

1. **Using the `className` prop** to add custom styles
2. **Using CSS variables** to customize the look:

```css
:root {
  --file-upload-border: theme('colors.gray.200');
  --file-upload-border-hover: theme('colors.primary.500');
  --file-upload-bg: theme('colors.white');
  --file-upload-text: theme('colors.gray.700');
  --file-upload-progress: theme('colors.primary.500');
}
```

## Accessibility

The component includes the following accessibility features:

- Keyboard navigation support
- ARIA attributes for screen readers
- Focus management
- Error messages for invalid files
- Loading states for screen readers

## Error Handling

The component will display error messages for:

- File type not allowed
- File size too large
- Maximum number of files exceeded
- Upload failures

## Examples

### Basic Usage

```tsx
<FileUpload 
  onUpload={handleUpload}
/>
```

### Multiple Files with Custom Accept

```tsx
<FileUpload
  onUpload={handleUpload}
  accept="image/*,.pdf"
  maxFiles={3}
  buttonText="Upload Documents"
/>
```

### Custom Styling

```tsx
<FileUpload
  onUpload={handleUpload}
  className="border-2 border-dashed border-blue-200 bg-blue-50 p-8 rounded-lg"
/>
```

## Testing

Component tests are located in `src/__tests__/components/FileUpload.test.tsx`.

To run the tests:

```bash
npm test FileUpload
```

## Browser Support

The component works in all modern browsers. For IE11 support, you'll need to include polyfills for:

- `Promise`
- `FileReader`
- `Object.entries`
- `Array.from`

## License

MIT
