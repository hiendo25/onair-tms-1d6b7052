CREATE TABLE public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id text NOT NULL,
  item_type text NOT NULL DEFAULT 'course',
  item_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own favorites" ON public.user_favorites
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own favorites" ON public.user_favorites
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own favorites" ON public.user_favorites
  FOR DELETE TO authenticated USING (auth.uid() = user_id);