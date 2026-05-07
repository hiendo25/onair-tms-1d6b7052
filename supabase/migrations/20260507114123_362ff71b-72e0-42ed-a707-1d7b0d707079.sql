-- Step 1: Schema fixes for dashboard features

-- 1) user_certificates table
CREATE TABLE public.user_certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  certificate_id uuid NOT NULL,
  org_id text NOT NULL,
  certificate_title text NOT NULL DEFAULT '',
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_certificates_user ON public.user_certificates(user_id);
CREATE INDEX idx_user_certificates_org ON public.user_certificates(org_id);
CREATE INDEX idx_user_certificates_expires ON public.user_certificates(expires_at);

ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read user_certificates in org"
  ON public.user_certificates FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "users insert own user_certificates"
  ON public.user_certificates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users update own user_certificates"
  ON public.user_certificates FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users delete own user_certificates"
  ON public.user_certificates FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_user_certificates_updated_at
  BEFORE UPDATE ON public.user_certificates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) employees.user_id (HR ↔ auth link)
ALTER TABLE public.employees ADD COLUMN user_id uuid;
CREATE INDEX idx_employees_user_id ON public.employees(user_id);

-- 3) user_learning_path_progress.completed_at
ALTER TABLE public.user_learning_path_progress ADD COLUMN completed_at timestamptz;

-- 4) assignments.pass_score
ALTER TABLE public.assignments ADD COLUMN pass_score int NOT NULL DEFAULT 70;
