
create or replace function public.is_org_member(_user_id uuid, _org_id text)
returns boolean
language sql stable security invoker set search_path = public
as $$
  select _user_id is not null and exists (select 1 from public.organizations where id = _org_id)
$$;
