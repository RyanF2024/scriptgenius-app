-- Enable pgcrypto for secure random string generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table to store MFA factors
CREATE TABLE IF NOT EXISTS public.mfa_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  factor_type TEXT NOT NULL CHECK (factor_type IN ('totp', 'webauthn')),
  secret TEXT,
  display_name TEXT,
  credential_id TEXT,
  public_key TEXT,
  counter BIGINT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, factor_type, credential_id)
);

-- Table to store backup codes
CREATE TABLE IF NOT EXISTS public.mfa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days')
);

-- Table for temporary MFA secrets during setup
CREATE TABLE IF NOT EXISTS public.mfa_temp_secrets (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Function to generate secure backup codes
CREATE OR REPLACE FUNCTION public.generate_secure_codes(count INTEGER)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  codes TEXT[] := '{}';
  i INTEGER;
  code TEXT;
BEGIN
  FOR i IN 1..count LOOP
    -- Generate a random 12-character alphanumeric code
    code := array_to_string(
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
    
    -- Format as XXXX-XXXX-XXXX for better readability
    code := 
      substr(code, 1, 4) || '-' ||
      substr(code, 5, 4) || '-' ||
      substr(code, 9, 4);
      
    codes := array_append(codes, code);
  END LOOP;
  
  RETURN codes;
END;
$$;

-- Function to generate and store backup codes
CREATE OR REPLACE FUNCTION public.generate_backup_codes(
  user_uuid UUID,
  code_count INTEGER DEFAULT 8
)
RETURNS TABLE (code_plain TEXT, code_hash TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  codes TEXT[];
  code TEXT;
  code_hash TEXT;
BEGIN
  -- Generate secure codes
  codes := public.generate_secure_codes(code_count);
  
  -- Delete any existing unused backup codes for this user
  DELETE FROM public.mfa_backup_codes
  WHERE user_id = user_uuid AND is_used = FALSE;
  
  -- Insert new backup codes
  FOREACH code IN ARRAY codes LOOP
    -- Hash the code before storing (using pgcrypto)
    code_hash := encode(digest(code, 'sha256'), 'hex');
    
    INSERT INTO public.mfa_backup_codes (user_id, code_hash)
    VALUES (user_uuid, code_hash);
    
    -- Return both plain and hashed codes (plain only shown once)
    code_plain := code;
    RETURN NEXT;
  END LOOP;
  
  -- Clean up expired backup codes
  DELETE FROM public.mfa_backup_codes
  WHERE user_id = user_uuid AND expires_at < NOW();
  
  RETURN;
END;
$$;

-- Function to verify a backup code
CREATE OR REPLACE FUNCTION public.verify_backup_code(
  user_uuid UUID,
  code TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code_record RECORD;
  code_hash TEXT;
BEGIN
  -- Hash the provided code
  code_hash := encode(digest(code, 'sha256'), 'hex');
  
  -- Find the code
  SELECT * INTO code_record
  FROM public.mfa_backup_codes
  WHERE user_id = user_uuid
    AND code_hash = code_hash
    AND is_used = FALSE
    AND expires_at > NOW()
  FOR UPDATE;
  
  IF code_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Mark the code as used
  UPDATE public.mfa_backup_codes
  SET is_used = TRUE, used_at = NOW()
  WHERE id = code_record.id;
  
  RETURN TRUE;
END;
$$;

-- Function to clean up MFA data when disabling 2FA
CREATE OR REPLACE FUNCTION public.delete_user_mfa_data(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all MFA factors
  DELETE FROM public.mfa_factors
  WHERE user_id = user_uuid;
  
  -- Delete all backup codes
  DELETE FROM public.mfa_backup_codes
  WHERE user_id = user_uuid;
  
  -- Delete any temporary secrets
  DELETE FROM public.mfa_temp_secrets
  WHERE user_id = user_uuid;
  
  -- Update user security preferences
  UPDATE public.user_security_preferences
  SET 
    mfa_enabled = FALSE,
    mfa_secret = NULL,
    mfa_method = NULL,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- If the row doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO public.user_security_preferences (user_id, mfa_enabled, updated_at)
    VALUES (user_uuid, FALSE, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET 
      mfa_enabled = FALSE,
      mfa_secret = NULL,
      mfa_method = NULL,
      updated_at = NOW();
  END IF;
END;
$$;

-- Function to verify user password for sensitive operations
CREATE OR REPLACE FUNCTION public.verify_user_password(
  user_uuid UUID,
  password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  is_valid BOOLEAN;
BEGIN
  -- Get the user's hashed password
  SELECT * INTO user_record
  FROM auth.users
  WHERE id = user_uuid;
  
  IF user_record IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Verify the password using Supabase's auth schema
  SELECT (auth.user_has_role(
    user_uuid,
    'authenticated'::TEXT
  ) AND (
    SELECT (auth.user_has_password(user_uuid) AND 
    auth.user_verify_password(
      user_uuid,
      password
    ))
  )) INTO is_valid;
  
  IF NOT is_valid THEN
    RAISE EXCEPTION 'Invalid password';
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Authentication failed';
END;
$$;

-- Set up RLS policies for MFA tables
ALTER TABLE public.mfa_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_temp_secrets ENABLE ROW LEVEL SECURITY;

-- MFA factors policies
CREATE POLICY "Users can view their own MFA factors"
  ON public.mfa_factors
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MFA factors"
  ON public.mfa_factors
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MFA factors"
  ON public.mfa_factors
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MFA factors"
  ON public.mfa_factors
  FOR DELETE
  USING (auth.uid() = user_id);

-- Backup codes policies
CREATE POLICY "Users can view their own backup codes"
  ON public.mfa_backup_codes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own backup codes"
  ON public.mfa_backup_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backup codes"
  ON public.mfa_backup_codes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Temporary secrets policies
CREATE POLICY "Users can view their own temporary secrets"
  ON public.mfa_temp_secrets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own temporary secrets"
  ON public.mfa_temp_secrets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own temporary secrets"
  ON public.mfa_temp_secrets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mfa_factors_user_id ON public.mfa_factors(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_user_id ON public.mfa_backup_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_code_hash ON public.mfa_backup_codes(code_hash) WHERE NOT is_used;
CREATE INDEX IF NOT EXISTS idx_mfa_temp_secrets_user_id ON public.mfa_temp_secrets(user_id);

-- Add comments to tables and columns
COMMENT ON TABLE public.mfa_factors IS 'Stores MFA factors (TOTP, WebAuthn) for user accounts';
COMMENT ON COLUMN public.mfa_factors.secret IS 'Encrypted secret key for TOTP';
COMMENT ON COLUMN public.mfa_factors.credential_id IS 'WebAuthn credential ID';
COMMENT ON COLUMN public.mfa_factors.public_key IS 'WebAuthn public key';

COMMENT ON TABLE public.mfa_backup_codes IS 'Stores backup codes for MFA recovery';
COMMENT ON COLUMN public.mfa_backup_codes.code_hash IS 'SHA-256 hash of the backup code';

COMMENT ON TABLE public.mfa_temp_secrets IS 'Temporary storage for MFA setup secrets';

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to mfa_factors
DROP TRIGGER IF EXISTS update_mfa_factors_updated_at ON public.mfa_factors;
CREATE TRIGGER update_mfa_factors_updated_at
BEFORE UPDATE ON public.mfa_factors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a function to clean up expired temporary secrets
CREATE OR REPLACE FUNCTION public.cleanup_expired_temp_secrets()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.mfa_temp_secrets
  WHERE expires_at < NOW();
END;
$$;

-- Schedule the cleanup function to run daily
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p 
    JOIN pg_extension e ON e.extname = 'pg_cron' 
    WHERE p.proname = 'schedule'
  ) THEN
    -- pg_cron extension is not available, skip scheduling
    RAISE NOTICE 'pg_cron extension not available, skipping scheduled cleanup';
  ELSE
    -- Schedule the cleanup function to run daily at 3 AM
    PERFORM cron.schedule(
      'cleanup-expired-mfa-secrets',
      '0 3 * * *',
      'SELECT public.cleanup_expired_temp_secrets()'
    );
  END IF;
END
$$;
