ALTER TABLE public.exam_assignments
ADD COLUMN IF NOT EXISTS available_from timestamp with time zone;