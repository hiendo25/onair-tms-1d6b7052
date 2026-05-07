
-- 1. Alter learning_paths
ALTER TABLE public.learning_paths
  ADD COLUMN IF NOT EXISTS cover_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS version int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_by uuid;

-- Remap status values: draft -> inactive, archived -> locked
UPDATE public.learning_paths SET status = 'inactive' WHERE status = 'draft';
UPDATE public.learning_paths SET status = 'locked' WHERE status = 'archived';
ALTER TABLE public.learning_paths ALTER COLUMN status SET DEFAULT 'inactive';

-- 2. learning_path_stages
CREATE TABLE IF NOT EXISTS public.learning_path_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  learning_path_id uuid NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  stage_order int NOT NULL DEFAULT 0,
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_path_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read lps" ON public.learning_path_stages FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert lps" ON public.learning_path_stages FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update lps" ON public.learning_path_stages FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete lps" ON public.learning_path_stages FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

-- 3. learning_path_stage_courses
CREATE TABLE IF NOT EXISTS public.learning_path_stage_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  stage_id uuid NOT NULL REFERENCES public.learning_path_stages(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.online_courses(id) ON DELETE CASCADE,
  course_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_path_stage_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read lpsc" ON public.learning_path_stage_courses FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert lpsc" ON public.learning_path_stage_courses FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update lpsc" ON public.learning_path_stage_courses FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete lpsc" ON public.learning_path_stage_courses FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

-- 4. learning_path_stage_assignments
CREATE TABLE IF NOT EXISTS public.learning_path_stage_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  stage_id uuid NOT NULL REFERENCES public.learning_path_stages(id) ON DELETE CASCADE,
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  unlock_condition text NOT NULL DEFAULT 'after_all_courses' CHECK (unlock_condition IN ('after_all_courses','always')),
  required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_path_stage_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read lpsa" ON public.learning_path_stage_assignments FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert lpsa" ON public.learning_path_stage_assignments FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update lpsa" ON public.learning_path_stage_assignments FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete lpsa" ON public.learning_path_stage_assignments FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

-- 5. learning_path_settings
CREATE TABLE IF NOT EXISTS public.learning_path_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  learning_path_id uuid NOT NULL UNIQUE REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  sequential_mode boolean NOT NULL DEFAULT false,
  completion_threshold int NOT NULL DEFAULT 100 CHECK (completion_threshold BETWEEN 80 AND 100),
  deadline_days int,
  allow_retake boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_path_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read lpset" ON public.learning_path_settings FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert lpset" ON public.learning_path_settings FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update lpset" ON public.learning_path_settings FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete lpset" ON public.learning_path_settings FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

-- 6. learning_path_audience
CREATE TABLE IF NOT EXISTS public.learning_path_audience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  learning_path_id uuid NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('all','user','department','branch')),
  target_id uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid
);
ALTER TABLE public.learning_path_audience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read lpa" ON public.learning_path_audience FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert lpa" ON public.learning_path_audience FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update lpa" ON public.learning_path_audience FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete lpa" ON public.learning_path_audience FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

-- 7. learning_path_enrollments
CREATE TABLE IF NOT EXISTS public.learning_path_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  learning_path_id uuid NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  deadline timestamptz,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','overdue')),
  progress int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (learning_path_id, user_id)
);
ALTER TABLE public.learning_path_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read lpe in org" ON public.learning_path_enrollments FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert lpe" ON public.learning_path_enrollments FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update lpe" ON public.learning_path_enrollments FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete lpe" ON public.learning_path_enrollments FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

-- 8. learning_path_versions
CREATE TABLE IF NOT EXISTS public.learning_path_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  learning_path_id uuid NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  version int NOT NULL,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  change_note text NOT NULL DEFAULT ''
);
ALTER TABLE public.learning_path_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read lpv" ON public.learning_path_versions FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert lpv" ON public.learning_path_versions FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));

-- 9. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  channel text NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app','email','push')),
  read boolean NOT NULL DEFAULT false,
  sent_at timestamptz NOT NULL DEFAULT now(),
  ref_type text,
  ref_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own notif" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "members read org notif" ON public.notifications FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert notif" ON public.notifications FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "users update own notif" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users delete own notif" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lps_path ON public.learning_path_stages(learning_path_id, stage_order);
CREATE INDEX IF NOT EXISTS idx_lpsc_stage ON public.learning_path_stage_courses(stage_id, course_order);
CREATE INDEX IF NOT EXISTS idx_lpsa_stage ON public.learning_path_stage_assignments(stage_id);
CREATE INDEX IF NOT EXISTS idx_lpa_path ON public.learning_path_audience(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_lpe_user ON public.learning_path_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_lpe_path ON public.learning_path_enrollments(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_lpv_path ON public.learning_path_versions(learning_path_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_notif_user ON public.notifications(user_id, read, sent_at DESC);

-- updated_at triggers
CREATE TRIGGER set_updated_at_lps BEFORE UPDATE ON public.learning_path_stages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_lpset BEFORE UPDATE ON public.learning_path_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_lpe BEFORE UPDATE ON public.learning_path_enrollments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket for cover images
INSERT INTO storage.buckets (id, name, public) VALUES ('learning-path-covers', 'learning-path-covers', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read lp covers" ON storage.objects FOR SELECT USING (bucket_id = 'learning-path-covers');
CREATE POLICY "auth upload lp covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'learning-path-covers');
CREATE POLICY "auth update lp covers" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'learning-path-covers');
CREATE POLICY "auth delete lp covers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'learning-path-covers');
