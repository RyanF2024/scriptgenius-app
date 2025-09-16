# Profile Management

This document outlines the profile management system, including avatar uploads, file validation, and security policies using Supabase Storage and Row Level Security (RLS).

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Avatar Upload](#avatar-upload)
- [File Validation](#file-validation)
- [Storage Structure](#storage-structure)
- [RLS Policies](#rls-policies)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Reference](#api-reference)

## Architecture Overview

### Components
1. **Frontend**
   - Profile form with file upload
   - Image preview and cropping
   - Progress indicators
   - Error handling and validation

2. **API Layer**
   - File upload endpoints
   - Profile update handlers
   - Validation middleware

3. **Storage**
   - Supabase Storage for file storage
   - Database for metadata and user references
   - CDN for optimized delivery

### Data Flow
1. User selects file
2. Client-side validation
3. File upload to Supabase Storage
4. Database record creation
5. CDN URL generation
6. UI update with new avatar

## Avatar Upload

### Client-Side Implementation with Supabase

```typescript
// lib/supabase/storage.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path);

  return {
    path: data.path,
    url: publicUrl,
  };
}
```

```tsx
import { useProfile } from '@/contexts/ProfileContext';
import { useRef, useState } from 'react';

export function AvatarUpload() {
  const { uploadAvatar } = useProfile();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setProgress(0);
      
      await uploadAvatar(file, {
        onProgress: (progress) => setProgress(progress),
      });
      
      // Success handling
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        disabled={isUploading}
        style={{ display: 'none' }}
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? `Uploading... ${progress}%` : 'Upload Avatar'}
      </button>
    </div>
  );
}
```

## File Validation

### Client-Side Validation

```typescript
// utils/fileValidation.ts
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPG, PNG, and WebP images are allowed',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size must be less than 5MB',
    };
  }

  // Check image dimensions if needed
  return { valid: true };
}
```

### Server-Side Validation

```typescript
// pages/api/upload-avatar.ts
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify user session
  const supabase = createServerSupabaseClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Process file upload...
}
```

### Client-Side Validation

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: 'File size must be less than 5MB' 
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Only JPG, PNG, and WebP images are allowed' 
    };
  }

  return { valid: true };
}
```

### Server-Side Validation

```sql
-- Check file size and type in database function
CREATE OR REPLACE FUNCTION validate_avatar_upload(
  user_id uuid,
  file_size bigint,
  file_type text
) RETURNS boolean AS $$
BEGIN
  -- Check file size (5MB limit)
  IF file_size > 5 * 1024 * 1024 THEN
    RAISE EXCEPTION 'File size exceeds 5MB limit';
  END IF;
  
  -- Check file type
  IF file_type NOT IN ('image/jpeg', 'image/png', 'image/webp') THEN
    RAISE EXCEPTION 'Invalid file type. Only JPG, PNG, and WebP are allowed';
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Storage Structure

### Supabase Storage Bucket: `avatars`

```
avatars/
  ├── user_<uuid>/
  │   ├── avatar_<timestamp>.<ext>  # Current avatar
  │   └── avatar_<timestamp>_<size>.<ext>  # Optimized versions
  └── temp_uploads/  # Temporary storage for uploads
```

### Database Schema

```sql
-- User profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Storage policies for avatars
CREATE POLICY "Users can view their own avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can upload their own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );
```

### Supabase Storage Bucket: `avatars`

```bash
avatars/
  ├── {user_id}/
  │   ├── avatar.jpg
  │   └── avatar_thumbnail.jpg
```

### Database Tables

#### `profiles`
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

## RLS Policies

### Storage Policies

```sql
-- Allow public access to avatars (read-only)
CREATE POLICY "Public Access to Avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Row Level Security

```sql
-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

## Error Handling

### Common Error Responses

```json
{
  "error": "UPLOAD_ERROR",
  "message": "Failed to upload file",
  "details": "File size exceeds limit"
}
```

### Error Types
- `INVALID_FILE_TYPE`: Unsupported file type
- `FILE_TOO_LARGE`: File exceeds size limit
- `UPLOAD_FAILED`: General upload failure
- `PERMISSION_DENIED`: Insufficient permissions
- `RATE_LIMIT_EXCEEDED`: Too many upload attempts

## Rate Limiting

### Client-Side Rate Limiting
- 5 uploads per minute per user
- 50MB total upload size per hour
- 1000 requests per hour per IP

### Server-Side Protection
- Request validation
- File size limits
- MIME type verification
- Virus scanning (if applicable)

### Profiles Table Policies

```sql
-- Users can view any profile
CREATE POLICY "Public profiles are viewable by everyone." 
ON profiles FOR SELECT 
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE 
USING (auth.uid() = id);
```

### Storage Bucket Policies

```sql
-- Allow authenticated users to view avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload/update their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## API Reference

### Upload Avatar

**Endpoint**: `POST /api/profile/avatar`

**Request**:
```typescript
interface UploadAvatarRequest {
  file: File;
  onProgress?: (progress: number) => void;
}
```

**Response**:
```typescript
interface UploadAvatarResponse {
  url: string;
  path: string;
  size: number;
  mimeType: string;
}
```

### Delete Avatar

**Endpoint**: `DELETE /api/profile/avatar`

**Response**:
```typescript
{
  success: boolean;
}
```

## Error Handling

Common error responses:

```typescript
{
  "error": "UNAUTHORIZED",
  "message": "You must be logged in to perform this action"
}

{
  "error": "FILE_TOO_LARGE",
  "message": "File size exceeds 5MB limit"
}

{
  "error": "INVALID_FILE_TYPE",
  "message": "Only JPG, PNG, and WebP images are allowed"
}
```

## Best Practices

1. **Client-Side**:
   - Validate file size and type before upload
   - Show upload progress to users
   - Handle network interruptions gracefully
   - Provide clear error messages

2. **Server-Side**:
   - Always validate file contents, not just extensions
   - Use RLS for fine-grained access control
   - Set appropriate CORS policies
   - Monitor storage usage

3. **Security**:
   - Never trust client-side validation alone
   - Sanitize file names
   - Store files with random names
   - Set appropriate content-disposition headers
   - Regularly audit access patterns
