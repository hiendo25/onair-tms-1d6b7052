-- Question folders (hierarchical)
CREATE TABLE IF NOT EXISTS public.question_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  parent_id uuid REFERENCES public.question_folders(id) ON DELETE RESTRICT,
  name text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.question_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read qf" ON public.question_folders FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert qf" ON public.question_folders FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update qf" ON public.question_folders FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete qf" ON public.question_folders FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

-- Extend question_bank
ALTER TABLE public.question_bank
  ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES public.question_folders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS correct_answers jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Extend assignments (exam templates)
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS time_limit_minutes integer,
  ADD COLUMN IF NOT EXISTS max_attempts integer,
  ADD COLUMN IF NOT EXISTS shuffle_questions boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shuffle_answers boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_results boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS total_points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by uuid;

-- Exam questions (link table)
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.question_bank(id) ON DELETE RESTRICT,
  sort_order integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, question_id)
);
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read eq" ON public.exam_questions FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert eq" ON public.exam_questions FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update eq" ON public.exam_questions FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete eq" ON public.exam_questions FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

-- Exam assignments (lần gán)
CREATE TABLE IF NOT EXISTS public.exam_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  exam_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE RESTRICT,
  exam_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  audience jsonb NOT NULL DEFAULT '[]'::jsonb,
  student_ids uuid[] NOT NULL DEFAULT '{}',
  deadline timestamptz,
  status text NOT NULL DEFAULT 'active',
  assigned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.exam_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read ea" ON public.exam_assignments FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert ea" ON public.exam_assignments FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update ea" ON public.exam_assignments FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete ea" ON public.exam_assignments FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

-- Attempts
CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  exam_assignment_id uuid NOT NULL REFERENCES public.exam_assignments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  attempt_number integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'in_progress',
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  score numeric,
  passed boolean,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own ea att" ON public.exam_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_org_member(auth.uid(), org_id));
CREATE POLICY "users insert own ea att" ON public.exam_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own ea att" ON public.exam_attempts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_eq_assignment ON public.exam_questions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_ea_exam ON public.exam_assignments(exam_id);
CREATE INDEX IF NOT EXISTS idx_eatt_assign ON public.exam_attempts(exam_assignment_id);
CREATE INDEX IF NOT EXISTS idx_eatt_user ON public.exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_qf_parent ON public.question_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_qb_folder ON public.question_bank(folder_id);

CREATE TRIGGER trg_qf_updated_at BEFORE UPDATE ON public.question_folders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_ea_updated_at BEFORE UPDATE ON public.exam_assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_eatt_updated_at BEFORE UPDATE ON public.exam_attempts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();