-- P2: Keep assignments.total_questions, assigned_count, completed_count in sync via triggers.

-- ─── total_questions: count of exam_questions rows for this assignment ─────────
CREATE OR REPLACE FUNCTION public.sync_assignment_total_questions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  target_id uuid;
BEGIN
  target_id := COALESCE(NEW.assignment_id, OLD.assignment_id);
  UPDATE public.assignments
    SET total_questions = (
      SELECT COUNT(*) FROM public.exam_questions WHERE assignment_id = target_id
    )
    WHERE id = target_id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_eq_total_questions ON public.exam_questions;
CREATE TRIGGER trg_eq_total_questions
  AFTER INSERT OR DELETE ON public.exam_questions
  FOR EACH ROW EXECUTE FUNCTION public.sync_assignment_total_questions();

-- ─── assigned_count: count of exam_assignments rows for this assignment ─────────
CREATE OR REPLACE FUNCTION public.sync_assignment_assigned_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  target_id uuid;
BEGIN
  target_id := COALESCE(NEW.exam_id, OLD.exam_id);
  UPDATE public.assignments
    SET assigned_count = (
      SELECT COUNT(*) FROM public.exam_assignments WHERE exam_id = target_id
    )
    WHERE id = target_id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_ea_assigned_count ON public.exam_assignments;
CREATE TRIGGER trg_ea_assigned_count
  AFTER INSERT OR DELETE ON public.exam_assignments
  FOR EACH ROW EXECUTE FUNCTION public.sync_assignment_assigned_count();

-- ─── completed_count: submitted exam_attempts joined through exam_assignments ──
CREATE OR REPLACE FUNCTION public.sync_assignment_completed_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  target_assignment_id uuid;
BEGIN
  SELECT ea.exam_id INTO target_assignment_id
    FROM public.exam_assignments ea
    WHERE ea.id = COALESCE(NEW.exam_assignment_id, OLD.exam_assignment_id);

  IF target_assignment_id IS NOT NULL THEN
    UPDATE public.assignments
      SET completed_count = (
        SELECT COUNT(DISTINCT att.user_id)
        FROM public.exam_attempts att
        JOIN public.exam_assignments ea ON ea.id = att.exam_assignment_id
        WHERE ea.exam_id = target_assignment_id
          AND att.status = 'submitted'
      )
      WHERE id = target_assignment_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_eatt_completed_count ON public.exam_attempts;
CREATE TRIGGER trg_eatt_completed_count
  AFTER INSERT OR UPDATE OF status ON public.exam_attempts
  FOR EACH ROW EXECUTE FUNCTION public.sync_assignment_completed_count();

-- ─── Backfill current counts ──────────────────────────────────────────────────
UPDATE public.assignments a
  SET
    total_questions = (SELECT COUNT(*) FROM public.exam_questions eq WHERE eq.assignment_id = a.id),
    assigned_count  = (SELECT COUNT(*) FROM public.exam_assignments ea WHERE ea.exam_id = a.id),
    completed_count = (
      SELECT COUNT(DISTINCT att.user_id)
      FROM public.exam_attempts att
      JOIN public.exam_assignments ea ON ea.id = att.exam_assignment_id
      WHERE ea.exam_id = a.id AND att.status = 'submitted'
    );
