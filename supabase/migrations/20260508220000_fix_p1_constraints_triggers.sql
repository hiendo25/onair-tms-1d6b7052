-- Batch 2 P1: FK constraints, UNIQUE constraints, and counter triggers

-- ─── exam_attempts: prevent duplicate attempt_number per (assignment, user) ───
ALTER TABLE public.exam_attempts
  ADD CONSTRAINT uq_exam_attempt_number
  UNIQUE (exam_assignment_id, user_id, attempt_number);

-- ─── survey_responses: prevent duplicate submission per (survey, user) ─────────
-- Only enforce for non-anonymous (user_id NOT NULL); anonymous rows (NULL) are allowed freely.
CREATE UNIQUE INDEX IF NOT EXISTS uq_survey_response_user
  ON public.survey_responses (survey_id, user_id)
  WHERE user_id IS NOT NULL;

-- ─── surveys.responses_count trigger ─────────────────────────────────────────
-- Keeps surveys.responses_count in sync automatically; removes the best-effort
-- counter bump in the submit-survey edge function.
CREATE OR REPLACE FUNCTION public.sync_survey_responses_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.surveys
      SET responses_count = responses_count + 1
      WHERE id = NEW.survey_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.surveys
      SET responses_count = GREATEST(responses_count - 1, 0)
      WHERE id = OLD.survey_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_survey_responses_count ON public.survey_responses;
CREATE TRIGGER trg_survey_responses_count
  AFTER INSERT OR DELETE ON public.survey_responses
  FOR EACH ROW EXECUTE FUNCTION public.sync_survey_responses_count();

-- Backfill current counts to match reality
UPDATE public.surveys s
  SET responses_count = (
    SELECT COUNT(*) FROM public.survey_responses sr WHERE sr.survey_id = s.id
  );

-- ─── exam_assignments: FK to assignments (exam_id) already exists; add missing indexes ──
CREATE INDEX IF NOT EXISTS idx_eatt_org ON public.exam_attempts(org_id);
CREATE INDEX IF NOT EXISTS idx_ea_status ON public.exam_assignments(status);

-- ─── assignment_submissions: add missing FK for assignment_id ────────────────
-- assignment_submissions.assignment_id references assignments(id)
-- The column exists as uuid but may lack the FK; add it idempotently.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_asub_assignment'
      AND table_name = 'assignment_submissions'
  ) THEN
    ALTER TABLE public.assignment_submissions
      ADD CONSTRAINT fk_asub_assignment
      FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;
  END IF;
END$$;
