ALTER TABLE public.online_courses ADD COLUMN IF NOT EXISTS is_required boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.course_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.online_courses(id) ON DELETE CASCADE,
  org_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_sections_course_idx ON public.course_sections(course_id);
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read course_sections" ON public.course_sections FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert course_sections" ON public.course_sections FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update course_sections" ON public.course_sections FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete course_sections" ON public.course_sections FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

CREATE TABLE IF NOT EXISTS public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.online_courses(id) ON DELETE CASCADE,
  org_id text NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  lesson_type text NOT NULL DEFAULT 'file',
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_lessons_section_idx ON public.course_lessons(section_id);
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read course_lessons" ON public.course_lessons FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert course_lessons" ON public.course_lessons FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update course_lessons" ON public.course_lessons FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete course_lessons" ON public.course_lessons FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));