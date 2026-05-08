
-- Extend flashcards
ALTER TABLE public.flashcards
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS content text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true;

UPDATE public.flashcards SET name = COALESCE(name, title) WHERE name IS NULL;

-- classroom_flashcards
CREATE TABLE IF NOT EXISTS public.classroom_flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  classroom_id uuid NOT NULL,
  flashcard_id uuid NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (classroom_id, flashcard_id)
);
CREATE INDEX IF NOT EXISTS idx_cfc_classroom ON public.classroom_flashcards(classroom_id);
CREATE INDEX IF NOT EXISTS idx_cfc_flashcard ON public.classroom_flashcards(flashcard_id);

ALTER TABLE public.classroom_flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read cfc" ON public.classroom_flashcards FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members insert cfc" ON public.classroom_flashcards FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update cfc" ON public.classroom_flashcards FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete cfc" ON public.classroom_flashcards FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));

-- user_flashcards
CREATE TABLE IF NOT EXISTS public.user_flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  user_id uuid NOT NULL,
  flashcard_id uuid NOT NULL,
  classroom_id uuid,
  content_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  viewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, flashcard_id)
);
CREATE INDEX IF NOT EXISTS idx_ufc_user ON public.user_flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_ufc_scheduled ON public.user_flashcards(scheduled_at);

ALTER TABLE public.user_flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own ufc" ON public.user_flashcards FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_org_member(auth.uid(), org_id));
CREATE POLICY "users update own ufc" ON public.user_flashcards FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "members insert ufc" ON public.user_flashcards FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
