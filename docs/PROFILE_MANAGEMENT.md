# Profile Management

This document outlines the profile management system, including avatar uploads, file validation, and security policies.

## Table of Contents
- [Avatar Upload](#avatar-upload)
- [File Validation](#file-validation)
- [Storage Structure](#storage-structure)
- [RLS Policies](#rls-policies)
- [API Reference](#api-reference)

## Avatar Upload

### Client-Side Implementation

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
