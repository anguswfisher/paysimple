-- Users are managed by Supabase Auth, this extends their profile
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  company_name text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'team')),
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Function to create profile for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, company_name)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'company'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  contract_file_url text,
  contract_text text,
  status text default 'uploaded' check (status in ('uploaded', 'processing', 'reviewed', 'complete')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.extracted_terms (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  category text not null check (category in ('contract_basics', 'payment_terms', 'retainage', 'milestones', 'insurance', 'lien_waivers', 'change_orders')),
  field_name text not null,
  extracted_value jsonb,
  confidence_score real,
  source_location text,
  user_override jsonb,
  created_at timestamptz default now()
);

create table public.payment_schedules (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  version integer default 1,
  schedule_data jsonb not null,
  total_contract_sum numeric(12,2),
  total_retainage numeric(12,2),
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.compliance_flags (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  severity text not null check (severity in ('high', 'medium', 'low')),
  category text not null,
  title text not null,
  description text,
  recommendation text,
  source_clause text,
  is_resolved boolean default false,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.extracted_terms enable row level security;
alter table public.payment_schedules enable row level security;
alter table public.compliance_flags enable row level security;

-- RLS policies: users can only access their own data
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can view own projects" on public.projects for select using (auth.uid() = user_id);
create policy "Users can create projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on public.projects for delete using (auth.uid() = user_id);
create policy "Users can view own terms" on public.extracted_terms for select using (
  project_id in (select id from public.projects where user_id = auth.uid())
);
create policy "Users can manage own terms" on public.extracted_terms for all using (
  project_id in (select id from public.projects where user_id = auth.uid())
);
create policy "Users can view own schedules" on public.payment_schedules for select using (
  project_id in (select id from public.projects where user_id = auth.uid())
);
create policy "Users can manage own schedules" on public.payment_schedules for all using (
  project_id in (select id from public.projects where user_id = auth.uid())
);
create policy "Users can view own flags" on public.compliance_flags for select using (
  project_id in (select id from public.projects where user_id = auth.uid())
);
create policy "Users can manage own flags" on public.compliance_flags for all using (
  project_id in (select id from public.projects where user_id = auth.uid())
);
-- Allow users to insert their own profile (needed for the trigger)
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
