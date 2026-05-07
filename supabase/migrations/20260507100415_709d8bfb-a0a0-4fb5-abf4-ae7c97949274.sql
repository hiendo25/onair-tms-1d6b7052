-- user_xp
CREATE TABLE public.user_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id text NOT NULL,
  xp integer NOT NULL DEFAULT 0,
  rank text NOT NULL DEFAULT 'Tân binh',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id)
);
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read xp in org" ON public.user_xp FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "users insert own xp" ON public.user_xp FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own xp" ON public.user_xp FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- user_course_progress
CREATE TABLE public.user_course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id text NOT NULL,
  course_id uuid NOT NULL,
  course_title text NOT NULL DEFAULT '',
  progress integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'in_progress',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own course progress" ON public.user_course_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own course progress" ON public.user_course_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own course progress" ON public.user_course_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users delete own course progress" ON public.user_course_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- user_learning_path_progress
CREATE TABLE public.user_learning_path_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id text NOT NULL,
  path_id uuid NOT NULL,
  path_title text NOT NULL DEFAULT '',
  total_lessons integer NOT NULL DEFAULT 0,
  completed_lessons integer NOT NULL DEFAULT 0,
  progress integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, path_id)
);
ALTER TABLE public.user_learning_path_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own path progress" ON public.user_learning_path_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users write own path progress" ON public.user_learning_path_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own path progress" ON public.user_learning_path_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users delete own path progress" ON public.user_learning_path_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- assignment_submissions
CREATE TABLE public.assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id text NOT NULL,
  assignment_id uuid NOT NULL,
  assignment_title text NOT NULL DEFAULT '',
  assignment_type text NOT NULL DEFAULT 'quiz',
  deadline timestamptz,
  status text NOT NULL DEFAULT 'pending',
  score numeric,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own submissions" ON public.assignment_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own submissions" ON public.assignment_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own submissions" ON public.assignment_submissions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- user_stats (aggregated per user)
CREATE TABLE public.user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id text NOT NULL,
  completed_courses integer NOT NULL DEFAULT 0,
  quizzes_taken integer NOT NULL DEFAULT 0,
  average_score numeric NOT NULL DEFAULT 0,
  hours_learned integer NOT NULL DEFAULT 0,
  branch text NOT NULL DEFAULT '',
  display_name text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id)
);
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read stats in org" ON public.user_stats FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "users insert own stats" ON public.user_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own stats" ON public.user_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- updated_at triggers
CREATE TRIGGER tg_user_xp_updated BEFORE UPDATE ON public.user_xp FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tg_user_course_progress_updated BEFORE UPDATE ON public.user_course_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tg_user_path_progress_updated BEFORE UPDATE ON public.user_learning_path_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tg_assignment_submissions_updated BEFORE UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tg_user_stats_updated BEFORE UPDATE ON public.user_stats FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();