
-- Add structured content + frame info to certificates
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS content jsonb NOT NULL DEFAULT '{
    "heading": "CHỨNG NHẬN HOÀN THÀNH",
    "awarded_to_label": "Chứng nhận này được trao cho",
    "description": "Hoàn thành xuất sắc chương trình",
    "issue_date_label": "Ngày phát hành",
    "expire_date_label": "Ngày hết hạn"
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS frame_url text NOT NULL DEFAULT '';

-- Frame library (admin uploaded frames available for reuse)
CREATE TABLE IF NOT EXISTS public.certificate_frames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  name text NOT NULL,
  image_url text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.certificate_frames ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read frames" ON public.certificate_frames FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members write frames" ON public.certificate_frames FOR INSERT TO authenticated WITH CHECK (is_org_member(auth.uid(), org_id));
CREATE POLICY "members update frames" ON public.certificate_frames FOR UPDATE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members delete frames" ON public.certificate_frames FOR DELETE TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE TRIGGER set_updated_at_certificate_frames BEFORE UPDATE ON public.certificate_frames FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Public bucket for frames + certificate previews
INSERT INTO storage.buckets (id, name, public) VALUES ('certificate-assets', 'certificate-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read certificate-assets" ON storage.objects FOR SELECT USING (bucket_id = 'certificate-assets');
CREATE POLICY "auth upload certificate-assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificate-assets');
CREATE POLICY "auth update certificate-assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'certificate-assets');
CREATE POLICY "auth delete certificate-assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'certificate-assets');
