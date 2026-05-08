import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Loader2, Award } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCertificates, useCertificateMutations,
  useCertificateFrames, useCertificateFrameMutations,
  type CertificateContent,
} from "@/lib/data-hooks";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/admin/certificates/edit/$id")({
  head: () => ({ meta: [{ title: "Tạo / sửa mẫu chứng nhận — OnAir TMS" }] }),
  component: Editor,
});

const DEFAULT_CONTENT: CertificateContent = {
  heading: "CHỨNG NHẬN HOÀN THÀNH",
  awarded_to_label: "Chứng nhận này được trao cho",
  description: "Hoàn thành xuất sắc chương trình",
  issue_date_label: "Ngày phát hành",
  expire_date_label: "Ngày hết hạn",
};

const LIMITS = { heading: 50, awarded_to_label: 60, description: 100, issue_date_label: 30, expire_date_label: 30, title: 100 };

function CertificatePreview({ frameUrl, content }: { frameUrl?: string; content: CertificateContent }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-white shadow-sm">
      {frameUrl ? (
        <img src={frameUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-3 border-2 border-amber-300/60 rounded-md" />
      )}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-8 py-6">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">[Tổ chức]</div>
        <h2 className="text-xl md:text-2xl font-serif font-bold text-amber-700 tracking-wide">{content.heading}</h2>
        <p className="text-[11px] text-slate-600 italic mt-2">{content.awarded_to_label}</p>
        <p className="font-serif italic text-2xl text-slate-800 my-3">[Họ và tên]</p>
        <p className="text-xs text-slate-600">{content.description}</p>
        <div className="mt-2 inline-block rounded bg-amber-700/90 text-white text-[10px] px-2 py-1">[Tên lớp học]</div>
        <div className="mt-auto pt-4 flex w-full justify-between text-[9px] text-slate-500">
          <div><div>{content.issue_date_label}</div><div className="text-[8px] opacity-60">[Ngày phát hành]</div></div>
          <div className="text-right"><div>{content.expire_date_label}</div><div className="text-[8px] opacity-60">[Ngày hết hạn]</div></div>
        </div>
      </div>
    </div>
  );
}

function Editor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const nav = useNavigate();
  const { orgId } = useOrg();
  const { data: rows = [] } = useCertificates();
  const { data: frames = [] } = useCertificateFrames();
  const cm = useCertificateMutations();
  const fm = useCertificateFrameMutations();

  const existing = !isNew ? rows.find(r => r.id === id) : undefined;

  const [title, setTitle] = useState("");
  const [frameUrl, setFrameUrl] = useState("");
  const [content, setContent] = useState<CertificateContent>(DEFAULT_CONTENT);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const frameFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setFrameUrl(existing.frame_url || "");
      setContent({ ...DEFAULT_CONTENT, ...(existing.content || {}) });
    }
  }, [existing?.id]);

  const setField = (k: keyof CertificateContent, v: string) => {
    if (v.length > LIMITS[k]) return;
    setContent(c => ({ ...c, [k]: v }));
  };

  async function uploadFrame(file: File, addToLibrary: boolean) {
    setUploading(true);
    try {
      const path = `${orgId}/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;
      const { error } = await supabase.storage.from("certificate-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("certificate-assets").getPublicUrl(path);
      setFrameUrl(data.publicUrl);
      if (addToLibrary) {
        await fm.create.mutateAsync({ name: file.name, image_url: data.publicUrl, is_default: false } as any);
      }
      toast.success("Đã tải khung lên");
    } catch (e: any) {
      toast.error(e.message || "Tải lên thất bại");
    } finally { setUploading(false); }
  }

  async function save() {
    if (!title.trim()) { toast.error("Vui lòng nhập tên mẫu"); return; }
    const payload = {
      title: title.trim(),
      code: existing?.code || `CERT-${Date.now().toString().slice(-6)}`,
      description: content.description,
      template_url: existing?.template_url || "",
      frame_url: frameUrl,
      content,
      valid_months: existing?.valid_months ?? 12,
      issued_count: existing?.issued_count ?? 0,
      status: existing?.status || "active",
    };
    if (isNew) {
      await cm.create.mutateAsync(payload as any);
      toast.success("Đã tạo mẫu");
    } else {
      await cm.update.mutateAsync({ id, ...payload } as any);
      toast.success("Đã lưu");
    }
    nav({ to: "/admin/certificates" });
  }

  const breadcrumbs = useMemo(() => [
    { title: "Chứng nhận", path: "/admin/certificates" },
    { title: isNew ? "Tạo mẫu chứng nhận" : "Chỉnh sửa mẫu" },
  ], [isNew]);

  return (
    <PageContainer
      title={isNew ? "Tạo mẫu chứng nhận" : "Chỉnh sửa mẫu chứng nhận"}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => nav({ to: "/admin/certificates" })}>Hủy</Button>
          <Button onClick={save} disabled={cm.create.isPending || cm.update.isPending}>Lưu mẫu</Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left column */}
        <Card>
          <CardHeader><CardTitle className="text-base">Thông tin mẫu chứng nhận</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Tên mẫu chứng nhận <span className="text-destructive">*</span></Label>
              <Input value={title} onChange={e => e.target.value.length <= LIMITS.title && setTitle(e.target.value)} placeholder="Nhập tên mẫu chứng nhận" />
              <div className="text-[11px] text-muted-foreground mt-1">Tối đa {LIMITS.title} ký tự</div>
            </div>

            <div>
              <Label className="mb-2 block">Chọn khung có sẵn</Label>
              <div className="grid grid-cols-4 gap-2">
                <button type="button" onClick={() => setFrameUrl("")} className={cn(
                  "aspect-[4/3] rounded border-2 bg-muted flex items-center justify-center text-xs text-muted-foreground",
                  !frameUrl ? "border-primary" : "border-transparent"
                )}>Trống</button>
                {frames.map(f => (
                  <button key={f.id} type="button" onClick={() => setFrameUrl(f.image_url)} className={cn(
                    "aspect-[4/3] rounded border-2 overflow-hidden",
                    frameUrl === f.image_url ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
                  )}>
                    <img src={f.image_url} alt={f.name} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Tải khung mẫu lên</Label>
              <div className="text-[11px] text-muted-foreground mb-2">File jpg/png/svg • Tối đa 5MB</div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => {
                const f = e.target.files?.[0]; if (f) uploadFrame(f, false); e.target.value = "";
              }} />
              <input ref={frameFileRef} type="file" accept="image/*" hidden onChange={(e) => {
                const f = e.target.files?.[0]; if (f) uploadFrame(f, true); e.target.value = "";
              }} />
              <div
                onClick={() => fileRef.current?.click()}
                className="aspect-[16/6] rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/40 transition"
              >
                {uploading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
                <div className="text-sm mt-2">{uploading ? "Đang tải..." : "Tải ảnh lên"}</div>
              </div>
              <Button type="button" variant="link" size="sm" className="mt-1 px-0" onClick={() => frameFileRef.current?.click()}>
                Lưu vào thư viện khung
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Cấu hình nội dung</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {([
                ["heading", "Chứng nhận hoàn thành"],
                ["awarded_to_label", "Chứng nhận này được trao cho"],
                ["description", "Hoàn thành xuất sắc chương trình"],
                ["issue_date_label", "Ngày phát hành"],
                ["expire_date_label", "Ngày hết hạn"],
              ] as const).map(([k, label]) => (
                <div key={k}>
                  <Label>{label}</Label>
                  {k === "description" ? (
                    <Textarea rows={2} value={content[k]} onChange={e => setField(k, e.target.value)} />
                  ) : (
                    <Input value={content[k]} onChange={e => setField(k, e.target.value)} />
                  )}
                  <div className="text-[11px] text-muted-foreground mt-1">Tối đa {LIMITS[k]} ký tự</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Xem trước</CardTitle>
              <Award className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <CertificatePreview frameUrl={frameUrl} content={content} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
