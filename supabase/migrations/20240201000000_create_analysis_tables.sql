-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp" with schema extensions;

-- Scripts table to store uploaded scripts
create table if not exists public.scripts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  file_path text not null,
  file_type text not null,
  file_size bigint not null,
  content text,
  word_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint file_path_unique unique (file_path)
);

-- Enable Row Level Security (RLS) on scripts table
alter table public.scripts enable row level security;

-- RLS policies for scripts
create policy "Users can view their own scripts"
  on public.scripts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own scripts"
  on public.scripts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own scripts"
  on public.scripts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own scripts"
  on public.scripts for delete
  using (auth.uid() = user_id);

-- Analyses table to store analysis results
create type analysis_status as enum ('pending', 'in_progress', 'completed', 'failed');

create table if not exists public.analyses (
  id uuid default uuid_generate_v4() primary key,
  script_id uuid not null references public.scripts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  status analysis_status not null default 'pending',
  content text,
  metadata jsonb,
  credits_used integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_script_analysis_type unique (script_id, type)
);

-- Indexes for faster lookups
create index if not exists analyses_script_id_idx on public.analyses(script_id);
create index if not exists analyses_user_id_idx on public.analyses(user_id);
create index if not exists analyses_status_idx on public.analyses(status);

-- RLS policies for analyses
alter table public.analyses enable row level security;

create policy "Users can view their own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own analyses"
  on public.analyses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own analyses"
  on public.analyses for delete
  using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers to update updated_at
create trigger update_scripts_updated_at
  before update on public.scripts
  for each row
  execute function update_updated_at_column();

create trigger update_analyses_updated_at
  before update on public.analyses
  for each row
  execute function update_updated_at_column();

-- Function to get user's credit balance
create or replace function get_user_credits(user_id uuid)
returns integer as $$
declare
  credit_balance integer;
begin
  select coalesce(credits, 0) into credit_balance
  from public.profiles
  where id = user_id;
  
  return credit_balance;
end;
$$ language plpgsql security definer;

-- Function to update user credits
create or replace function update_user_credits(
  user_id uuid,
  amount_change integer
)
returns void as $$
begin
  update public.profiles
  set credits = credits + amount_change,
      updated_at = timezone('utc'::text, now())
  where id = user_id;
  
  -- Insert into credits log
  insert into public.credit_transactions (user_id, amount, description)
  values (user_id, amount_change, 
    case 
      when amount_change > 0 then 'Credits added'
      else 'Credits used for analysis'
    end
  );
end;
$$ language plpgsql security definer;

-- Credit transactions table for audit log
create table if not exists public.credit_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for credit_transactions
alter table public.credit_transactions enable row level security;

create policy "Users can view their own credit transactions"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

-- Function to get analysis with script details
create or replace function get_analysis_with_script(analysis_id uuid)
returns table (
  id uuid,
  script_id uuid,
  script_title text,
  type text,
  status analysis_status,
  content text,
  credits_used integer,
  created_at timestamptz,
  updated_at timestamptz
) as $$
begin
  return query
  select 
    a.id,
    a.script_id,
    s.title as script_title,
    a.type,
    a.status,
    a.content,
    a.credits_used,
    a.created_at,
    a.updated_at
  from public.analyses a
  join public.scripts s on a.script_id = s.id
  where a.id = analysis_id
  and a.user_id = auth.uid();
end;
$$ language plpgsql security definer;
