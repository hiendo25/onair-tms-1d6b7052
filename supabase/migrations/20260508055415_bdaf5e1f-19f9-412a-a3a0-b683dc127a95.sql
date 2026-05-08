
ALTER TABLE public.classrooms ADD COLUMN IF NOT EXISTS certificate_id uuid;
ALTER TABLE public.online_courses ADD COLUMN IF NOT EXISTS certificate_id uuid;

ALTER TABLE public.user_certificates
  ADD COLUMN IF NOT EXISTS recipient_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS class_id uuid,
  ADD COLUMN IF NOT EXISTS course_id uuid,
  ADD COLUMN IF NOT EXISTS template_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.user_certificates ALTER COLUMN expires_at DROP NOT NULL;

-- Auto-issue certificate when course completed
CREATE OR REPLACE FUNCTION public.auto_issue_certificate_on_course_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cert_id uuid;
  v_cert record;
  v_name text;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    SELECT certificate_id INTO v_cert_id FROM public.online_courses WHERE id = NEW.course_id;
    IF v_cert_id IS NULL THEN RETURN NEW; END IF;

    SELECT * INTO v_cert FROM public.certificates WHERE id = v_cert_id;
    IF NOT FOUND THEN RETURN NEW; END IF;

    SELECT COALESCE(full_name, email, '') INTO v_name FROM public.profiles WHERE id = NEW.user_id;

    INSERT INTO public.user_certificates (
      user_id, certificate_id, org_id, certificate_title, recipient_name,
      course_id, issued_at, expires_at, status, template_snapshot
    ) VALUES (
      NEW.user_id, v_cert_id, NEW.org_id, v_cert.title, COALESCE(v_name, ''),
      NEW.course_id, now(),
      CASE WHEN v_cert.valid_months > 0 THEN now() + (v_cert.valid_months || ' months')::interval ELSE NULL END,
      'active',
      jsonb_build_object('content', v_cert.content, 'frame_url', v_cert.frame_url, 'title', v_cert.title)
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_issue_cert_course ON public.course_enrollments;
CREATE TRIGGER trg_auto_issue_cert_course
AFTER UPDATE ON public.course_enrollments
FOR EACH ROW EXECUTE FUNCTION public.auto_issue_certificate_on_course_complete();
