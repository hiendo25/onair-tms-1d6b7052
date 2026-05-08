-- Extend online_courses
ALTER TABLE public.online_courses
  ADD COLUMN IF NOT EXISTS author_id uuid,
  ADD COLUMN IF NOT EXISTS author_name text NOT NULL DEFAULT '';

-- Extend course_lessons for content types
ALTER TABLE public.course_lessons
  ADD COLUMN IF NOT EXISTS content_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS content_meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS quiz_assignment_id uuid,
  ADD COLUMN IF NOT EXISTS duration_seconds integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

-- Course enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  course_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  progress integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read ce" ON public.course_enrollments FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert ce" ON public.course_enrollments FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update ce" ON public.course_enrollments FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete ce" ON public.course_enrollments FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

-- Lesson progress
CREATE TABLE IF NOT EXISTS public.course_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  course_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  progress_pct integer NOT NULL DEFAULT 0,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, user_id)
);
ALTER TABLE public.course_lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own clp" ON public.course_lesson_progress FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_org_member(auth.uid(), org_id));
CREATE POLICY "users insert own clp" ON public.course_lesson_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own clp" ON public.course_lesson_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Audit logs
CREATE TABLE IF NOT EXISTS public.course_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  course_id uuid,
  user_id uuid,
  action text NOT NULL,
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.course_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read cal" ON public.course_audit_logs FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert cal" ON public.course_audit_logs FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));

-- Storage bucket for course content (video/pdf/scorm)
INSERT INTO storage.buckets (id, name, public) VALUES ('course-content', 'course-content', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "course-content read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'course-content');
CREATE POLICY "course-content insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-content');
CREATE POLICY "course-content update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'course-content');
CREATE POLICY "course-content delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'course-content');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_lesson_progress_user ON public.course_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_lesson_progress_course ON public.course_lesson_progress(course_id);