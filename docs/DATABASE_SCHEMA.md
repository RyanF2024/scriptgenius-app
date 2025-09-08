# Database Schema Documentation

This document provides a comprehensive overview of the database schema, including tables, relationships, and storage buckets.

## Table of Contents
- [Core Tables](#core-tables)
- [Storage Buckets](#storage-buckets)
- [Row Level Security](#row-level-security)
- [Indexes](#indexes)
- [Database Functions](#database-functions)

## Core Tables

### `profiles`
Stores user profile information.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT username_format CHECK (username ~* '^[a-z0-9_]{3,30}$')
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create index for username lookups
CREATE INDEX idx_profiles_username ON public.profiles (LOWER(username));
```

### `user_preferences`
Stores user preferences and settings.

```sql
CREATE TABLE public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  email_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
```

## Storage Buckets

### `avatars`
Stores user profile pictures with the following structure:
```
avatars/
  {user_id}/
    original.{ext}      # Original uploaded file
    small.{ext}         # 48x48px
    medium.{ext}        # 128x128px
    large.{ext}         # 256x256px
```

#### Bucket Configuration
- **Public**: False (requires authentication)
- **File Size Limit**: 5MB
- **Allowed MIME Types**: image/jpeg, image/png, image/webp
- **Cache Control**: 1 year (31536000 seconds)

## Row Level Security

### Profiles Table Policies

```sql
-- Anyone can view public profiles
CREATE POLICY "Public profiles are viewable by everyone." 
ON profiles FOR SELECT 
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);
```

### User Preferences Policies

```sql
-- Users can view their own preferences
CREATE POLICY "Users can view their own preferences"
ON user_preferences FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
ON user_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences"
ON user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Storage Bucket Policies

```sql
-- Anyone can view avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload to their own avatar directory
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
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

## Indexes

```sql
-- For fast username lookups (case-insensitive)
CREATE INDEX idx_profiles_username_lower ON public.profiles (LOWER(username));

-- For user profile queries
CREATE INDEX idx_profiles_updated_at ON public.profiles (updated_at);
```

## Database Functions

### `handle_new_user()`
Automatically creates a profile and preferences when a new user signs up.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    LOWER(SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### `update_updated_at()`
Automatically updates the `updated_at` timestamp on record updates.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles table
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at();

-- Apply to user_preferences table
CREATE TRIGGER handle_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at();
```

## Migrations

### Creating a New Migration

```bash
# Create a new migration file
supabase migration new add_user_preferences

# Apply migrations
supabase db push
```

### Example Migration: Add Avatar URL to Profiles

```sql
-- migrations/20240101000000_add_avatar_url.sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to the user''s profile picture';
```

## Best Practices

1. **Schema Changes**:
   - Always use migrations for schema changes
   - Include `IF NOT EXISTS` for additive changes
   - Document all new columns and tables

2. **Performance**:
   - Add indexes for frequently queried columns
   - Consider partial indexes for filtered queries
   - Monitor query performance

3. **Security**:
   - Always enable RLS on new tables
   - Follow the principle of least privilege
   - Regularly audit access patterns

4. **Data Integrity**:
   - Use appropriate constraints
   - Set up cascading deletes where appropriate
   - Consider soft deletes for important data
