CREATE POLICY "members read submissions" ON public.assignment_submissions
  FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "members update submissions" ON public.assignment_submissions
  FOR UPDATE TO authenticated
  USING (public.is_org_member(auth.uid(), org_id))
  WITH CHECK (public.is_org_member(auth.uid(), org_id));