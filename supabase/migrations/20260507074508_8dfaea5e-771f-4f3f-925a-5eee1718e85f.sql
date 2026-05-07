
-- Helper to create updated_at trigger
DO $$ BEGIN
  -- employees
  CREATE TABLE IF NOT EXISTS public.employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id text NOT NULL,
    employee_code text NOT NULL DEFAULT '',
    name text NOT NULL,
    email text NOT NULL DEFAULT '',
    phone text NOT NULL DEFAULT '',
    branch text NOT NULL DEFAULT '',
    department text NOT NULL DEFAULT '',
    role text NOT NULL DEFAULT '',
    position text NOT NULL DEFAULT '',
    type text NOT NULL DEFAULT 'fulltime',
    status text NOT NULL DEFAULT 'active',
    avatar_url text NOT NULL DEFAULT '',
    joined_at date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.online_courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id text NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    category text NOT NULL DEFAULT '',
    level text NOT NULL DEFAULT 'beginner',
    duration_minutes integer NOT NULL DEFAULT 0,
    instructor text NOT NULL DEFAULT '',
    students_count integer NOT NULL DEFAULT 0,
    lessons_count integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'draft',
    cover_url text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.classrooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id text NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    instructor text NOT NULL DEFAULT '',
    location text NOT NULL DEFAULT '',
    capacity integer NOT NULL DEFAULT 0,
    students_count integer NOT NULL DEFAULT 0,
    start_date date,
    end_date date,
    type text NOT NULL DEFAULT 'offline',
    status text NOT NULL DEFAULT 'upcoming',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.learning_paths (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id text NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    category text NOT NULL DEFAULT '',
    courses_count integer NOT NULL DEFAULT 0,
    duration_hours integer NOT NULL DEFAULT 0,
    students_count integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id text NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    type text NOT NULL DEFAULT 'quiz',
    deadline timestamptz,
    total_questions integer NOT NULL DEFAULT 0,
    assigned_count integer NOT NULL DEFAULT 0,
    completed_count integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.question_bank (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id text NOT NULL,
    question text NOT NULL,
    type text NOT NULL DEFAULT 'single',
    category text NOT NULL DEFAULT '',
    difficulty text NOT NULL DEFAULT 'medium',
    options jsonb NOT NULL DEFAULT '[]'::jsonb,
    correct_answer text NOT NULL DEFAULT '',
    points integer NOT NULL DEFAULT 1,
    tags text[] NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id text NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    template_url text NOT NULL DEFAULT '',
    valid_months integer NOT NULL DEFAULT 12,
    issued_count integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.surveys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id text NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    type text NOT NULL DEFAULT 'general',
    anonymous boolean NOT NULL DEFAULT false,
    start_date date,
    end_date date,
    responses_count integer NOT NULL DEFAULT 0,
    target_count integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.flashcards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id text NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    category text NOT NULL DEFAULT '',
    cards_count integer NOT NULL DEFAULT 0,
    students_count integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.gamifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id text NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    type text NOT NULL DEFAULT 'badge',
    points integer NOT NULL DEFAULT 0,
    badge_url text NOT NULL DEFAULT '',
    condition text NOT NULL DEFAULT '',
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id text NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    type text NOT NULL DEFAULT 'training',
    start_date date,
    end_date date,
    target_count integer NOT NULL DEFAULT 0,
    completed_count integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );
END $$;

-- Enable RLS + policies + updated_at trigger on each table
DO $$
DECLARE
  t text;
  tables text[] := ARRAY['employees','online_courses','classrooms','learning_paths','assignments','question_bank','certificates','surveys','flashcards','gamifications','plans'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "members read %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "members read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id))', t);
    EXECUTE format('DROP POLICY IF EXISTS "members insert %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "members insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (public.is_org_member(auth.uid(), org_id))', t);
    EXECUTE format('DROP POLICY IF EXISTS "members update %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "members update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (public.is_org_member(auth.uid(), org_id))', t);
    EXECUTE format('DROP POLICY IF EXISTS "members delete %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "members delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.is_org_member(auth.uid(), org_id))', t);
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at_%1$s ON public.%1$I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at_%1$s BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%1$s_org ON public.%1$I (org_id)', t);
  END LOOP;
END $$;
