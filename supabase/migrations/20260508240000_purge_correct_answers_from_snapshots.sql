-- P0 D1: Purge correct_answers from all existing exam_assignment snapshots.
-- The assign page no longer writes correct_answers into snapshots (fixed in code),
-- but rows already in the DB still carry the field inside the questions array.
-- This migration removes it from every row atomically.

UPDATE public.exam_assignments
SET exam_snapshot = jsonb_set(
  exam_snapshot,
  '{questions}',
  COALESCE(
    (
      SELECT jsonb_agg(q - 'correct_answers')
      FROM jsonb_array_elements(exam_snapshot -> 'questions') AS q
    ),
    '[]'::jsonb
  )
)
WHERE exam_snapshot -> 'questions' IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(exam_snapshot -> 'questions') AS q
    WHERE q ? 'correct_answers'
  );
