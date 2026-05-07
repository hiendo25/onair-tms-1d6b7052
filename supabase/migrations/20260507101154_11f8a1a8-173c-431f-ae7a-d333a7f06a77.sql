-- learning_activity table
create table public.learning_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  org_id text not null,
  action text not null,
  target_id text,
  target_type text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_learning_activity_user on public.learning_activity (user_id, created_at desc);
create index idx_learning_activity_org on public.learning_activity (org_id, created_at desc);

alter table public.learning_activity enable row level security;

create policy "users read own activity"
on public.learning_activity for select
to authenticated
using (auth.uid() = user_id);

create policy "users insert own activity"
on public.learning_activity for insert
to authenticated
with check (auth.uid() = user_id);

-- Storage bucket for course materials (private)
insert into storage.buckets (id, name, public)
values ('course-materials', 'course-materials', false)
on conflict (id) do nothing;

create policy "Authenticated users can read course materials"
on storage.objects for select
to authenticated
using (bucket_id = 'course-materials');

create policy "Authenticated users can upload to their folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'course-materials'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Authenticated users can update their files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'course-materials'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Authenticated users can delete their files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'course-materials'
  and auth.uid()::text = (storage.foldername(name))[1]
);