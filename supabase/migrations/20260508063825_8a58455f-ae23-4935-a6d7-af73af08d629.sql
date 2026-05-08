
-- Settings table (one row per org)
CREATE TABLE public.gamification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT true,
  course_enabled boolean NOT NULL DEFAULT true,
  course_points integer NOT NULL DEFAULT 100,
  class_enabled boolean NOT NULL DEFAULT true,
  class_points integer NOT NULL DEFAULT 150,
  phase_enabled boolean NOT NULL DEFAULT true,
  phase_points integer NOT NULL DEFAULT 200,
  path_enabled boolean NOT NULL DEFAULT true,
  path_points integer NOT NULL DEFAULT 500,
  assignment_enabled boolean NOT NULL DEFAULT true,
  assignment_points integer NOT NULL DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gamification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read gset" ON public.gamification_settings FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert gset" ON public.gamification_settings FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update gset" ON public.gamification_settings FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE TRIGGER gset_updated BEFORE UPDATE ON public.gamification_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Extend gamifications table
ALTER TABLE public.gamifications ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 0;
ALTER TABLE public.gamifications ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT '';
ALTER TABLE public.gamifications ADD COLUMN IF NOT EXISTS xp_required integer NOT NULL DEFAULT 0;

-- User badges
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read ub" ON public.user_badges FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert ub" ON public.user_badges FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete ub" ON public.user_badges FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

-- User titles (current title per user; one row per user)
CREATE TABLE public.user_titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  user_id uuid NOT NULL UNIQUE,
  title_id uuid NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read ut" ON public.user_titles FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR is_org_member(auth.uid(), org_id));
CREATE POLICY "members upsert ut" ON public.user_titles FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update ut" ON public.user_titles FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete ut" ON public.user_titles FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

-- Trigger: on course completion, award XP & re-evaluate title
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

    INSERT INTO public.user_xp (org_id, user_id, total_xp)
    VALUES (NEW.org_id, NEW.user_id, pts)
    ON CONFLICT (org_id, user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + pts, updated_at = now();

    SELECT total_xp INTO v_total FROM public.user_xp WHERE org_id = NEW.org_id AND user_id = NEW.user_id;

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

-- user_xp may not exist; create if missing
CREATE TABLE IF NOT EXISTS public.user_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  user_id uuid NOT NULL,
  total_xp integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "members read uxp" ON public.user_xp FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members write uxp" ON public.user_xp FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members update uxp" ON public.user_xp FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS trg_gamif_on_course_complete ON public.course_enrollments;
CREATE TRIGGER trg_gamif_on_course_complete
AFTER UPDATE ON public.course_enrollments
FOR EACH ROW EXECUTE FUNCTION public.gamification_on_course_complete();
