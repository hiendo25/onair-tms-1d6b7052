
-- Extend classrooms
ALTER TABLE public.classrooms
  ADD COLUMN IF NOT EXISTS delivery text NOT NULL DEFAULT 'offline', -- live | online | offline
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'single',      -- single | series
  ADD COLUMN IF NOT EXISTS cover_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS topics text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS objective text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS materials jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS meeting_provider text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS meeting_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS meeting_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS meeting_password text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS start_at timestamptz,
  ADD COLUMN IF NOT EXISTS end_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_by uuid;

-- Sessions for series mode
CREATE TABLE IF NOT EXISTS public.classroom_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  classroom_id uuid NOT NULL,
  session_order integer NOT NULL DEFAULT 0,
  title text NOT NULL DEFAULT '',
  start_at timestamptz,
  end_at timestamptz,
  location text NOT NULL DEFAULT '',
  meeting_provider text NOT NULL DEFAULT '',
  meeting_url text NOT NULL DEFAULT '',
  meeting_id text NOT NULL DEFAULT '',
  meeting_password text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.classroom_sessions ENABLE ROW LEVEL SECURITY;

-- Courses assigned to classroom or session, with instructors
CREATE TABLE IF NOT EXISTS public.classroom_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  classroom_id uuid NOT NULL,
  session_id uuid,
  course_id uuid NOT NULL,
  instructors jsonb NOT NULL DEFAULT '[]'::jsonb, -- array of {id,name}
  start_at timestamptz,
  end_at timestamptz,
  course_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.classroom_courses ENABLE ROW LEVEL SECURITY;

-- Assignments attached to classroom or session
CREATE TABLE IF NOT EXISTS public.classroom_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  classroom_id uuid NOT NULL,
  session_id uuid,
  assignment_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.classroom_assignments ENABLE ROW LEVEL SECURITY;

-- Agenda
CREATE TABLE IF NOT EXISTS public.classroom_agenda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  classroom_id uuid NOT NULL,
  session_id uuid,
  title text NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.classroom_agenda ENABLE ROW LEVEL SECURITY;

-- Assigned students
CREATE TABLE IF NOT EXISTS public.classroom_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  classroom_id uuid NOT NULL,
  user_id uuid,
  employee_id uuid,
  assigned_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;

-- QR settings
CREATE TABLE IF NOT EXISTS public.classroom_qr_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  classroom_id uuid NOT NULL,
  session_id uuid,
  start_offset_minutes integer NOT NULL DEFAULT 15, -- minutes before start
  end_offset_minutes integer NOT NULL DEFAULT 15,   -- minutes after start
  qr_token text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.classroom_qr_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies (org members)
DO $$ BEGIN
  CREATE POLICY "members read cs" ON public.classroom_sessions FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members insert cs" ON public.classroom_sessions FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members update cs" ON public.classroom_sessions FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members delete cs" ON public.classroom_sessions FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members read cc" ON public.classroom_courses FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members insert cc" ON public.classroom_courses FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members update cc" ON public.classroom_courses FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members delete cc" ON public.classroom_courses FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members read ca" ON public.classroom_assignments FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members insert ca" ON public.classroom_assignments FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members update ca" ON public.classroom_assignments FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members delete ca" ON public.classroom_assignments FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members read cag" ON public.classroom_agenda FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members insert cag" ON public.classroom_agenda FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members update cag" ON public.classroom_agenda FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members delete cag" ON public.classroom_agenda FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members read cst" ON public.classroom_students FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members insert cst" ON public.classroom_students FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members update cst" ON public.classroom_students FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members delete cst" ON public.classroom_students FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "members read cqr" ON public.classroom_qr_settings FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members insert cqr" ON public.classroom_qr_settings FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members update cqr" ON public.classroom_qr_settings FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members delete cqr" ON public.classroom_qr_settings FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_cs_classroom ON public.classroom_sessions(classroom_id);
CREATE INDEX IF NOT EXISTS idx_cc_classroom ON public.classroom_courses(classroom_id);
CREATE INDEX IF NOT EXISTS idx_ca_classroom ON public.classroom_assignments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_cag_classroom ON public.classroom_agenda(classroom_id);
CREATE INDEX IF NOT EXISTS idx_cst_classroom ON public.classroom_students(classroom_id);
CREATE INDEX IF NOT EXISTS idx_cqr_classroom ON public.classroom_qr_settings(classroom_id);
