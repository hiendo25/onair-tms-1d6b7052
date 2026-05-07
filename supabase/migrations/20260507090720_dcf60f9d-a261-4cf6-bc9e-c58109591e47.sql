ALTER TABLE public.org_roles 
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_instructor boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_student boolean NOT NULL DEFAULT false;