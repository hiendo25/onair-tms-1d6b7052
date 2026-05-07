
-- ============== Organizations ==============
create table public.organizations (
  id text primary key,
  name text not null,
  short text not null,
  domain text not null,
  industry text not null,
  brand_color text not null,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

create policy "anyone authenticated can read orgs"
  on public.organizations for select to authenticated using (true);

-- Seed 4 orgs
insert into public.organizations (id, name, short, domain, industry, brand_color) values
  ('highlands',  'Highlands Coffee Vietnam', 'HC', 'highlandscoffee.vn', 'Chuỗi F&B - 200+ cửa hàng',         '#9F1B1B'),
  ('pharmacity', 'Pharmacity',               'PM', 'pharmacity.vn',     'Chuỗi nhà thuốc - 1.100+ điểm',     '#0066B3'),
  ('didongviet', 'Di Động Việt',             'DV', 'didongviet.vn',     'Bán lẻ điện thoại - 80+ cửa hàng',  '#E30613'),
  ('circlek',    'Circle K Vietnam',         'CK', 'circlek.vn',        'Cửa hàng tiện lợi - 450+ điểm',     '#D7282F')
on conflict (id) do nothing;

-- ============== Org members ==============
create table public.org_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  org_id text not null references public.organizations(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (user_id, org_id)
);

alter table public.org_members enable row level security;

create policy "user can view own memberships"
  on public.org_members for select to authenticated
  using (auth.uid() = user_id);

create policy "user can insert own membership"
  on public.org_members for insert to authenticated
  with check (auth.uid() = user_id);

-- Helper: any authenticated user is treated as member of all orgs (demo project)
create or replace function public.is_org_member(_user_id uuid, _org_id text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select _user_id is not null and exists (select 1 from public.organizations where id = _org_id)
$$;

-- ============== Generic updated_at trigger ==============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- ============== Branches ==============
create table public.branches (
  id uuid primary key default gen_random_uuid(),
  org_id text not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  address text not null default '',
  phone text not null default '',
  manager text not null default '',
  employees integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_branches_org on public.branches(org_id);
alter table public.branches enable row level security;
create policy "members read branches"   on public.branches for select to authenticated using (public.is_org_member(auth.uid(), org_id));
create policy "members insert branches" on public.branches for insert to authenticated with check (public.is_org_member(auth.uid(), org_id));
create policy "members update branches" on public.branches for update to authenticated using (public.is_org_member(auth.uid(), org_id));
create policy "members delete branches" on public.branches for delete to authenticated using (public.is_org_member(auth.uid(), org_id));
create trigger trg_branches_updated before update on public.branches for each row execute function public.set_updated_at();

-- ============== Departments ==============
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  org_id text not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  branch text not null default '',
  head text not null default '',
  employees integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_departments_org on public.departments(org_id);
alter table public.departments enable row level security;
create policy "members read departments"   on public.departments for select to authenticated using (public.is_org_member(auth.uid(), org_id));
create policy "members insert departments" on public.departments for insert to authenticated with check (public.is_org_member(auth.uid(), org_id));
create policy "members update departments" on public.departments for update to authenticated using (public.is_org_member(auth.uid(), org_id));
create policy "members delete departments" on public.departments for delete to authenticated using (public.is_org_member(auth.uid(), org_id));
create trigger trg_departments_updated before update on public.departments for each row execute function public.set_updated_at();

-- ============== Roles ==============
create table public.org_roles (
  id uuid primary key default gen_random_uuid(),
  org_id text not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  description text not null default '',
  permissions integer not null default 0,
  users integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_org_roles_org on public.org_roles(org_id);
alter table public.org_roles enable row level security;
create policy "members read org_roles"   on public.org_roles for select to authenticated using (public.is_org_member(auth.uid(), org_id));
create policy "members insert org_roles" on public.org_roles for insert to authenticated with check (public.is_org_member(auth.uid(), org_id));
create policy "members update org_roles" on public.org_roles for update to authenticated using (public.is_org_member(auth.uid(), org_id));
create policy "members delete org_roles" on public.org_roles for delete to authenticated using (public.is_org_member(auth.uid(), org_id));
create trigger trg_org_roles_updated before update on public.org_roles for each row execute function public.set_updated_at();
