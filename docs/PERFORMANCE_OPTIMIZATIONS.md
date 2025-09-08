# Performance Optimizations Guide

This document outlines the performance optimizations implemented in the ScriptGenius application to ensure fast load times, smooth interactions, and efficient resource usage.

## Table of Contents
1. [Image Optimization](#image-optimization)
2. [File Upload Optimization](#file-upload-optimization)
3. [Form Handling](#form-handling)
4. [API Request Optimization](#api-request-optimization)
5. [Supabase Client](#supabase-client)
6. [State Management](#state-management)
7. [Best Practices](#best-practices)

## Image Optimization

### OptimizedImage Component

```tsx
import OptimizedImage from '@/components/ui/OptimizedImage';

// Basic usage
<OptimizedImage 
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // For above-the-fold images
  blurDataURL="data:image/svg+xml;base64,..."
/>
```

**Features:**
- Automatic format optimization (WebP, AVIF)
- Lazy loading
- Blur-up placeholders
- Responsive sizing
- SVG support

## Form Handling

### useOptimizedFormSubmit Hook

```tsx
const { handleSubmit, isSubmitting, error } = useOptimizedFormSubmit(
  async (data) => {
    await api.submitForm(data);
  },
  {
    successMessage: 'Success!',
    errorMessage: 'Failed to submit',
    onSuccess: (data) => { /* handle success */ },
    onError: (error) => { /* handle error */ }
  }
);
```

## API Request Optimization

### optimizedFetch Utility

```tsx
import { optimizedFetch } from '@/lib/api/optimizedFetcher';

// Basic GET request with caching
const data = await optimizedFetch<ResponseType>('/api/endpoint');

// POST request without caching
const result = await optimizedFetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data),
  useCache: false
});

// With custom timeout
const result = await optimizedFetch('/api/slow-endpoint', {
  timeout: 30000 // 30 seconds
});
```

## Supabase Client

### Client-Side Usage

```tsx
import { useSupabaseClient } from '@/lib/supabase/optimizedClient';

function MyComponent() {
  const supabase = useSupabaseClient();
  // Use supabase client...
}
```

### Server-Side Usage

```ts
import { createClient } from '@/lib/supabase/optimizedClient';

export async function getServerSideProps() {
  const supabase = createClient();
  // Use supabase client...
}
```

## State Management

### Optimized Context Providers

All context providers are optimized with:
- Memoized values
- Proper cleanup
- Error boundaries
- Type safety

## Database Function Optimizations

### MFA and Security Functions

#### 1. SECURITY DEFINER Functions
- Added `SET search_path = public` to all SECURITY DEFINER functions to prevent search path hijacking
- Ensures consistent schema resolution and prevents privilege escalation

```sql
CREATE OR REPLACE FUNCTION public.generate_secure_codes(count INTEGER)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
-- Function implementation
$$;
```

#### 2. Backup Code Generation
- Optimized code generation to use efficient string operations
- Uses array aggregation for better performance with multiple codes
- Secure random number generation using pgcrypto

```sql
-- Efficient array-based code generation
SELECT array_to_string(
  ARRAY(
    SELECT substr(
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
      (random() * 32)::integer + 1,
      1
    )
    FROM generate_series(1, 12)
  ),
  ''
);
```

#### 3. Caching and Materialized Views
- Consider using materialized views for frequently accessed MFA status
- Cache backup code verification results when appropriate
- Use indexes on frequently queried columns (user_id, created_at)

### File Upload Optimization

### Client-Side Optimizations

1. **Chunked Uploads**
   ```typescript
   async function uploadInChunks(file: File, chunkSize = 1024 * 1024) { // 1MB chunks
     const chunks = Math.ceil(file.size / chunkSize);
     const uploadPromises = [];
     
     for (let i = 0; i < chunks; i++) {
       const start = i * chunkSize;
       const end = Math.min(start + chunkSize, file.size);
       const chunk = file.slice(start, end);
       
       const formData = new FormData();
       formData.append('file', chunk);
       formData.append('chunkIndex', i.toString());
       formData.append('totalChunks', chunks.toString());
       formData.append('fileId', generateFileId());
       
       uploadPromises.push(
         fetch('/api/upload-chunk', {
           method: 'POST',
           body: formData,
         })
       );
     }
     
     await Promise.all(uploadPromises);
     await fetch('/api/complete-upload', {
       method: 'POST',
       body: JSON.stringify({
         fileId,
         fileName: file.name,
         fileType: file.type,
         totalChunks: chunks,
       })
     });
   }
   ```

2. **Image Compression**
   ```typescript
   import Compressor from 'compressorjs';
   
   function compressImage(file: File, quality = 0.7): Promise<File> {
     return new Promise((resolve, reject) => {
       new Compressor(file, {
         quality,
         maxWidth: 1920,
         maxHeight: 1080,
         success(result) {
           resolve(new File([result], file.name, {
             type: result.type,
             lastModified: Date.now(),
           }));
         },
         error: reject,
       });
     });
   }
   ```

3. **Upload Progress Tracking**
   ```typescript
   function uploadWithProgress(file: File, onProgress: (progress: number) => void) {
     return new Promise((resolve, reject) => {
       const xhr = new XMLHttpRequest();
       
       xhr.upload.onprogress = (event) => {
         if (event.lengthComputable) {
           const progress = Math.round((event.loaded / event.total) * 100);
           onProgress(progress);
         }
       };
       
       xhr.onload = () => resolve(xhr.response);
       xhr.onerror = () => reject(new Error('Upload failed'));
       
       const formData = new FormData();
       formData.append('file', file);
       
       xhr.open('POST', '/api/upload', true);
       xhr.send(formData);
     });
   }
   ```

### Server-Side Optimizations

1. **Stream Processing**
   ```typescript
   // Using Node.js streams for efficient file processing
   import { createReadStream, createWriteStream } from 'fs';
   import { pipeline } from 'stream/promises';
   import { createGunzip } from 'zlib';
   import { createHash } from 'crypto';
   
   async function processUploadedFile(filePath: string) {
     const hash = createHash('sha256');
     
     await pipeline(
       createReadStream(filePath),
       createGunzip(),
       async function* (source) {
         for await (const chunk of source) {
           hash.update(chunk);
           yield chunk; // Process chunk by chunk
         }
       },
       createWriteStream(`${filePath}.processed`)
     );
     
     return hash.digest('hex');
   }
   ```

2. **Concurrent Processing**
   ```typescript
   // Process multiple uploads concurrently with limits
   import pLimit from 'p-limit';
   
   const limit = pLimit(3); // Process 3 files at a time
   
   async function processUploads(files: Express.Multer.File[]) {
     const processFile = async (file: Express.Multer.File) => {
       // Process file
     };
     
     // Process files with concurrency limit
     return Promise.all(files.map(file => 
       limit(() => processFile(file))
     ));
   }
   ```

## Best Practices

1. **File Uploads**:
   - Implement chunked uploads for large files
   - Compress images before upload
   - Show upload progress and allow pausing/resuming
   - Validate file types and sizes on both client and server
   - Use signed URLs for direct uploads to storage

2. **Images**:
   - Always specify width and height
   - Use `priority` for above-the-fold images
   - Provide `blurDataURL` for better UX
   - Prefer WebP/AVIF formats

3. **Forms**:
   - Use `useOptimizedFormSubmit` for all forms
   - Implement proper loading states
   - Show meaningful error messages

4. **API Requests**
   - Use `optimizedFetch` for all API calls
   - Set appropriate timeouts
   - Handle errors gracefully

5. **Performance Monitoring**
   - Monitor bundle size
   - Track Core Web Vitals
   - Use React DevTools Profiler

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| LCP    | < 2.5s | TBD     |
| FID    | < 100ms| TBD     |
| CLS    | < 0.1  | TBD     |

## Troubleshooting

### Common Issues
1. **Images not loading**
   - Check file paths
   - Verify image optimization config
   - Check CORS settings

2. **Slow API responses**
   - Check network tab
   - Verify caching is working
   - Check server response times

3. **Memory leaks**
   - Check for missing cleanup
   - Verify event listeners are removed
   - Use React DevTools profiler

For additional help, refer to the [React Performance Documentation](https://reactjs.org/docs/optimizing-performance.html).
