
-- Add category + version to surveys
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT '';
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS created_by uuid;

-- Survey versions snapshot for editing-after-start scenarios
CREATE TABLE IF NOT EXISTS public.survey_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  org_id text NOT NULL,
  version integer NOT NULL,
  snapshot jsonb NOT NULL,
  created_by uuid,
  change_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.survey_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read sv" ON public.survey_versions FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert sv" ON public.survey_versions FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));

-- Survey assignments to students/groups
CREATE TABLE IF NOT EXISTS public.survey_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  org_id text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  student_ids uuid[] NOT NULL DEFAULT '{}',
  start_date timestamptz,
  end_date timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.survey_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read sas" ON public.survey_assignments FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert sas" ON public.survey_assignments FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update sas" ON public.survey_assignments FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete sas" ON public.survey_assignments FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE TRIGGER trg_sas_updated BEFORE UPDATE ON public.survey_assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Add version + assignment_id to survey_responses
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS assignment_id uuid REFERENCES public.survey_assignments(id) ON DELETE SET NULL;

-- Allow students to read their own responses
DROP POLICY IF EXISTS "users read own sr" ON public.survey_responses;
CREATE POLICY "users read own sr" ON public.survey_responses FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_org_member(auth.uid(), org_id));

-- Trigger to bump survey updated_at
CREATE OR REPLACE FUNCTION public.surveys_set_updated() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trg_surveys_updated ON public.surveys;
CREATE TRIGGER trg_surveys_updated BEFORE UPDATE ON public.surveys FOR EACH ROW EXECUTE FUNCTION public.surveys_set_updated();
