
CREATE OR REPLACE FUNCTION public.gamification_on_course_complete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s record;
  pts integer := 0;
  v_total integer := 0;
  v_title record;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    SELECT * INTO s FROM public.gamification_settings WHERE org_id = NEW.org_id;
    IF NOT FOUND OR s.enabled IS NOT TRUE OR s.course_enabled IS NOT TRUE THEN
      RETURN NEW;
    END IF;
    pts := COALESCE(s.course_points, 0);
    IF pts <= 0 THEN RETURN NEW; END IF;

    INSERT INTO public.user_xp (org_id, user_id, xp)
    VALUES (NEW.org_id, NEW.user_id, pts)
    ON CONFLICT (org_id, user_id) DO UPDATE SET xp = public.user_xp.xp + pts, updated_at = now();

    SELECT xp INTO v_total FROM public.user_xp WHERE org_id = NEW.org_id AND user_id = NEW.user_id;

    SELECT * INTO v_title FROM public.gamifications
      WHERE org_id = NEW.org_id AND type = 'title' AND active IS TRUE AND xp_required <= v_total
      ORDER BY priority DESC, xp_required DESC LIMIT 1;
    IF FOUND THEN
      INSERT INTO public.user_titles (org_id, user_id, title_id)
      VALUES (NEW.org_id, NEW.user_id, v_title.id)
      ON CONFLICT (user_id) DO UPDATE SET title_id = EXCLUDED.title_id, assigned_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
