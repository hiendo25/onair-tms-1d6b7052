
-- 1. Alter plans table
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS objective text DEFAULT '',
  ADD COLUMN IF NOT EXISTS budget numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason text DEFAULT '';

-- Status uses free text 'status' column. Normalize allowed values via check constraint.
-- Drop existing constraint if present, then add new one
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'plans_status_check') THEN
    ALTER TABLE public.plans DROP CONSTRAINT plans_status_check;
  END IF;
END $$;

-- Migrate existing values to new vocabulary
UPDATE public.plans SET status = 'draft' WHERE status NOT IN ('draft','pending_survey','pending','approved','rejected');

ALTER TABLE public.plans
  ADD CONSTRAINT plans_status_check CHECK (status IN ('draft','pending_survey','pending','approved','rejected'));

-- 2. training_plan_programs
CREATE TABLE IF NOT EXISTS public.training_plan_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  org_id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  start_date date,
  end_date date,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.training_plan_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read tpp" ON public.training_plan_programs FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert tpp" ON public.training_plan_programs FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update tpp" ON public.training_plan_programs FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete tpp" ON public.training_plan_programs FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE INDEX IF NOT EXISTS idx_tpp_plan ON public.training_plan_programs(plan_id);

-- 3. training_plan_topics
CREATE TABLE IF NOT EXISTS public.training_plan_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  program_id uuid REFERENCES public.training_plan_programs(id) ON DELETE CASCADE,
  org_id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.training_plan_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read tpt" ON public.training_plan_topics FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert tpt" ON public.training_plan_topics FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update tpt" ON public.training_plan_topics FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete tpt" ON public.training_plan_topics FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE INDEX IF NOT EXISTS idx_tpt_plan ON public.training_plan_topics(plan_id);
CREATE INDEX IF NOT EXISTS idx_tpt_program ON public.training_plan_topics(program_id);

-- 4. training_plan_program_courses
CREATE TABLE IF NOT EXISTS public.training_plan_program_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.training_plan_programs(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.online_courses(id) ON DELETE CASCADE,
  org_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(program_id, course_id)
);
ALTER TABLE public.training_plan_program_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read tppc" ON public.training_plan_program_courses FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert tppc" ON public.training_plan_program_courses FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete tppc" ON public.training_plan_program_courses FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

-- 5. training_plan_topic_courses
CREATE TABLE IF NOT EXISTS public.training_plan_topic_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.training_plan_topics(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.online_courses(id) ON DELETE CASCADE,
  org_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(topic_id, course_id)
);
ALTER TABLE public.training_plan_topic_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read tptc" ON public.training_plan_topic_courses FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert tptc" ON public.training_plan_topic_courses FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete tptc" ON public.training_plan_topic_courses FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

-- 6. training_plan_surveys
CREATE TABLE IF NOT EXISTS public.training_plan_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  org_id text NOT NULL,
  start_date date,
  end_date date,
  target_type text NOT NULL DEFAULT 'all' CHECK (target_type IN ('all','dept','branch')),
  target_unit_ids uuid[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','completed','cancelled')),
  result_summary jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.training_plan_surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read tps" ON public.training_plan_surveys FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert tps" ON public.training_plan_surveys FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update tps" ON public.training_plan_surveys FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete tps" ON public.training_plan_surveys FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE INDEX IF NOT EXISTS idx_tps_plan ON public.training_plan_surveys(plan_id);

-- 7. survey_questions
CREATE TABLE IF NOT EXISTS public.survey_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  org_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('single','multiple','yes_no','rating','essay','dropdown','sorting','vote')),
  content text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  correct_answer jsonb,
  order_index integer NOT NULL DEFAULT 0,
  required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read sq" ON public.survey_questions FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert sq" ON public.survey_questions FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update sq" ON public.survey_questions FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete sq" ON public.survey_questions FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE INDEX IF NOT EXISTS idx_sq_survey ON public.survey_questions(survey_id);

-- 8. survey_responses
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  org_id text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read sr" ON public.survey_responses FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "users insert own sr" ON public.survey_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE INDEX IF NOT EXISTS idx_sr_survey ON public.survey_responses(survey_id);

-- 9. survey_answers
CREATE TABLE IF NOT EXISTS public.survey_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  org_id text NOT NULL,
  value jsonb NOT NULL DEFAULT 'null',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.survey_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read sa" ON public.survey_answers FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert sa" ON public.survey_answers FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE INDEX IF NOT EXISTS idx_sa_response ON public.survey_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_sa_question ON public.survey_answers(question_id);

-- 10. tags on online_courses
ALTER TABLE public.online_courses ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_oc_tags ON public.online_courses USING GIN(tags);

-- updated_at triggers
CREATE TRIGGER trg_tpp_updated BEFORE UPDATE ON public.training_plan_programs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_tpt_updated BEFORE UPDATE ON public.training_plan_topics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_tps_updated BEFORE UPDATE ON public.training_plan_surveys FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
