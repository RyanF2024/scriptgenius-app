-- Enable pgcrypto for UUID generation
create extension if not exists pgcrypto;

-- Table to store 2FA secrets
create table if not exists public.mfa_factors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  factor_type text not null check (factor_type in ('totp', 'webauthn')),
  secret text,
  display_name text,
  is_verified boolean default false,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  unique(user_id, factor_type)
);

-- Table to store backup codes
create table if not exists public.mfa_backup_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  is_used boolean default false,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

-- Table to track user preferences for 2FA
create table if not exists public.user_security_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_mfa_enabled boolean not null default false,
  mfa_method text check (mfa_method in ('totp', 'webauthn', 'sms')),
  phone_number text,
  updated_at timestamptz not null default now()
);

-- Enable RLS on all new tables
alter table public.mfa_factors enable row level security;
alter table public.mfa_backup_codes enable row level security;
alter table public.user_security_preferences enable row level security;

-- RLS policies for mfa_factors
create policy "Users can view their own 2FA factors"
on public.mfa_factors for select
using (auth.uid() = user_id);

create policy "Users can insert their own 2FA factors"
on public.mfa_factors for insert
with check (auth.uid() = user_id);

create policy "Users can update their own 2FA factors"
on public.mfa_factors for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own 2FA factors"
on public.mfa_factors for delete
using (auth.uid() = user_id);

-- RLS policies for mfa_backup_codes
create policy "Users can view their own backup codes"
on public.mfa_backup_codes for select
using (auth.uid() = user_id);

create policy "Users can insert their own backup codes"
on public.mfa_backup_codes for insert
with check (auth.uid() = user_id);

create policy "Users can update their own backup codes"
on public.mfa_backup_codes for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- RLS policies for user_security_preferences
create policy "Users can view their own security preferences"
on public.user_security_preferences for select
using (auth.uid() = user_id);

create policy "Users can update their own security preferences"
on public.user_security_preferences for update
using (auth.uid() = user_id);

-- Function to generate backup codes
create or replace function public.generate_backup_codes(
  user_uuid uuid,
  code_count integer default 8
) returns setof text as $$
declare
  i integer;
  code text;
  code_hash text;
begin
  -- Delete any existing unused backup codes
  delete from public.mfa_backup_codes 
  where user_id = user_uuid and is_used = false;
  
  -- Generate new backup codes
  for i in 1..code_count loop
    -- Generate a random 16-character code
    code := upper(
      encode(gen_random_bytes(8), 'base64')
      || encode(gen_random_bytes(8), 'base64')
    );
    code := regexp_replace(code, '[^A-Z0-9]', '', 'g');
    code := substr(code, 1, 16);
    
    -- Store the hash of the code
    code_hash := crypt(code, gen_salt('bf'));
    
    insert into public.mfa_backup_codes (user_id, code_hash)
    values (user_uuid, code_hash);
    
    -- Return the plaintext code (only time it will be visible)
    return next code;
  end loop;
  
  -- Ensure security preferences record exists
  insert into public.user_security_preferences (user_id, is_mfa_enabled)
  values (user_uuid, true)
  on conflict (user_id) 
  do update set 
    is_mfa_enabled = true,
    updated_at = now();
    
  return;
end;
$$ language plpgsql security definer;
