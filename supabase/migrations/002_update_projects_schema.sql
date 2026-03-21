-- Add additional fields to projects table for comprehensive project information
alter table public.projects 
add column if not exists project_type text,
add column if not exists contract_value numeric(12,2),
add column if not exists start_date date,
add column if not exists estimated_completion date,
add column if not exists owner text,
add column if not exists contractor text,
add column if not exists architect text,
add column if not exists description text,
add column if not exists tags text[] default '{}';

-- Update the status check constraint if it doesn't include 'draft'
do $$
begin
    -- Drop existing constraint if it doesn't include 'draft'
    if exists (
        select 1 from information_schema.check_constraints 
        where constraint_name = 'projects_status_check'
    ) then
        alter table public.projects drop constraint projects_status_check;
    end if;
    
    -- Add updated constraint
    alter table public.projects add constraint projects_status_check 
        check (status in ('draft', 'uploaded', 'processing', 'reviewed', 'complete'));
exception
    when duplicate_object then null; -- Ignore if constraint already exists
end $$;

-- Create index for better performance
create index if not exists idx_projects_user_status on public.projects(user_id, status);
create index if not exists idx_projects_created_at on public.projects(created_at desc);

-- Add comments for documentation
comment on column public.projects.project_type is 'Type of construction project (commercial, residential, etc.)';
comment on column public.projects.contract_value is 'Total contract value in dollars';
comment on column public.projects.start_date is 'Project start date';
comment on column public.projects.estimated_completion is 'Estimated completion date';
comment on column public.projects.owner is 'Project owner company name';
comment on column public.projects.contractor is 'Contractor company name';
comment on column public.projects.architect is 'Architect company name';
comment on column public.projects.description is 'Project description and scope';
comment on column public.projects.tags is 'Project tags for categorization';
