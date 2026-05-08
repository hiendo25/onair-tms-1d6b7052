
CREATE OR REPLACE FUNCTION public.auto_queue_flashcards_on_course_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  v_last_date date;
  v_next_at timestamptz;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    -- Determine the latest already-scheduled day for this user
    SELECT MAX(scheduled_at::date) INTO v_last_date FROM public.user_flashcards WHERE user_id = NEW.user_id;
    v_next_at := GREATEST(now() + interval '15 minutes',
                          COALESCE((v_last_date + 1)::timestamptz, now() + interval '15 minutes'));

    FOR rec IN
      SELECT DISTINCT ON (f.id) f.id, f.name, f.title, f.content, f.image_url, cf.classroom_id, cf.display_order, cf.created_at
      FROM public.classroom_flashcards cf
      JOIN public.flashcards f ON f.id = cf.flashcard_id
      JOIN public.classroom_courses cc ON cc.classroom_id = cf.classroom_id
      WHERE cc.course_id = NEW.course_id
        AND f.enabled IS TRUE
        AND NOT EXISTS (
          SELECT 1 FROM public.user_flashcards ufc
          WHERE ufc.user_id = NEW.user_id AND ufc.flashcard_id = f.id
        )
      ORDER BY f.id, cf.display_order, cf.created_at
    LOOP
      INSERT INTO public.user_flashcards (
        org_id, user_id, flashcard_id, classroom_id, content_snapshot, scheduled_at
      ) VALUES (
        NEW.org_id, NEW.user_id, rec.id, rec.classroom_id,
        jsonb_build_object('name', COALESCE(rec.name, rec.title), 'content', rec.content, 'image_url', rec.image_url),
        v_next_at
      )
      ON CONFLICT (user_id, flashcard_id) DO NOTHING;
      v_next_at := v_next_at + interval '1 day';
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_queue_flashcards ON public.course_enrollments;
CREATE TRIGGER trg_auto_queue_flashcards
AFTER UPDATE ON public.course_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.auto_queue_flashcards_on_course_complete();
