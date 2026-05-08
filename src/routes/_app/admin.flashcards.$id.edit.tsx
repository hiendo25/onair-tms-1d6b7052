import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Upload, X, AlertTriangle } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_app/admin/flashcards/$id/edit")({
  head: () => ({ meta: [{ title: "Sửa Flashcard — OnAir TMS" }] }),
  component: EditFC,
});

function EditFC() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const { orgId } = useOrg();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing
  const { data: row, isLoading } = useQuery({
    queryKey: ["flashcard", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("flashcards").select("*").eq("id", id).single();
      if (error) throw error;
      return data as { name: string; title: string; content: string; image_url: string; enabled: boolean };
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (row) {
      setName(row.name || row.title || "");
      setContent(row.content || "");
      setImageUrl(row.image_url || "");
      setEnabled(row.enabled !== false);
    }
  }, [row]);

  // Check if already sent (warning when editing)
  const { data: sentCount = 0 } = useQuery({
    queryKey: ["flashcard-sent-count", id],
    queryFn: async () => {
      const { count } = await supabase.from("user_flashcards").select("*", { count: "exact", head: true }).eq("flashcard_id", id);
      return count ?? 0;
    },
    enabled: !isNew,
  });

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `flashcards/${orgId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("certificate-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("certificate-assets").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!name.trim()) { toast.error("Vui lòng nhập tên Flashcard"); return; }
    if (!content.trim()) { toast.error("Vui lòng nhập nội dung"); return; }
    setSaving(true);
    try {
      const payload = {
        name, title: name, content, image_url: imageUrl, enabled,
        status: enabled ? "active" : "inactive",
      };
      if (isNew) {
        const { error } = await supabase.from("flashcards").insert({ ...payload, org_id: orgId, code: `FC-${Date.now().toString().slice(-6)}` } as never);
        if (error) throw error;
        toast.success("Đã tạo Flashcard");
      } else {
        const { error } = await supabase.from("flashcards").update(payload as never).eq("id", id);
        if (error) throw error;
        toast.success("Đã cập nhật");
      }
      navigate({ to: "/admin/flashcards" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!isNew && isLoading) {
    return <PageContainer title="Đang tải..." breadcrumbs={[]}><div /></PageContainer>;
  }

  return (
    <PageContainer
      title={isNew ? "Tạo Flashcard" : "Chỉnh sửa Flashcard"}
      breadcrumbs={[{ title: "Flashcard", path: "/admin/flashcards" }, { title: isNew ? "Tạo mới" : "Chỉnh sửa" }]}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="p-6 space-y-5">
            {!isNew && sentCount > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Flashcard này đã được gửi tới <strong>{sentCount}</strong> học viên. Nội dung chỉnh sửa sẽ chỉ áp dụng cho các lượt gửi sau.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label>Tên Flashcard <span className="text-rose-500">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nguyên tắc giao tiếp 5W1H" />
              <p className="text-xs text-muted-foreground">Dùng để quản lý nội bộ, không bắt buộc hiển thị cho học viên.</p>
            </div>

            <div className="space-y-1.5">
              <Label>Nội dung <span className="text-rose-500">*</span></Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Text ngắn, súc tích để nhắc nhớ kiến thức..." maxLength={500} />
              <p className="text-xs text-muted-foreground text-right">{content.length}/500 — khuyến nghị ngắn để học viên đọc trong 15 giây</p>
            </div>

            <div className="space-y-1.5">
              <Label>Hình ảnh minh hoạ</Label>
              {imageUrl ? (
                <div className="relative inline-block">
                  <img src={imageUrl} alt="" className="rounded border max-h-48" />
                  <button type="button" className="absolute -top-2 -right-2 rounded-full bg-rose-600 text-white p-1 shadow" onClick={() => setImageUrl("")}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} className="border-2 border-dashed rounded-lg p-8 text-center w-full hover:bg-muted/30 transition">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">{uploading ? "Đang tải..." : "Chọn ảnh để upload (tuỳ chọn)"}</div>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            </div>

            <div className="flex items-center justify-between border-t pt-5">
              <div>
                <Label>Trạng thái</Label>
                <p className="text-xs text-muted-foreground">Bật để Flashcard có thể được gán và phát cho học viên.</p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            <div className="flex justify-end gap-2 border-t pt-5">
              <Button variant="outline" onClick={() => navigate({ to: "/admin/flashcards" })}>Huỷ</Button>
              <Button onClick={save} disabled={saving || uploading}>{saving ? "Đang lưu..." : "Lưu"}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium mb-3">Xem trước</div>
            <div className="rounded-xl border bg-gradient-to-br from-violet-50 to-blue-50 p-5 space-y-3">
              {imageUrl && <img src={imageUrl} alt="" className="rounded w-full max-h-40 object-contain bg-white/60" />}
              <div className="font-semibold">{name || "Tên Flashcard"}</div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[4rem]">{content || "Nội dung Flashcard sẽ hiển thị tại đây..."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
