-- D P0: Admin can read/update assignment_submissions for their org
-- Previously only users could read their own rows; admins had no visibility.
CREATE POLICY "org members read submissions" ON public.assignment_submissions
  FOR SELECT TO authenticated
  USING (is_org_member(auth.uid(), org_id));

CREATE POLICY "org members update submissions" ON public.assignment_submissions
  FOR UPDATE TO authenticated
  USING (is_org_member(auth.uid(), org_id));

-- E P0: survey_responses anonymous guard
-- user_id is already stored as NULL for anonymous surveys (enforced by edge function),
-- so individual rows cannot be linked to a person. The existing org-member SELECT policy
-- is acceptable; no structural change needed here.
-- However, restrict direct INSERT to authenticated users only via edge function (service role).
-- Drop the public insert policy and rely on the edge function's service-role key.
DROP POLICY IF EXISTS "users insert own sr" ON public.survey_responses;
-- survey_answers insert is already guarded by is_org_member; the edge function uses service
-- role so it bypasses RLS. No further change needed.
