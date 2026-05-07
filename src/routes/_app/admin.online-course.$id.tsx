import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, BookOpen, Pencil, Trash2, FileText, Video, ListChecks, GripVertical } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/online-course/$id")({
  head: () => ({ meta: [{ title: "Chi tiết khoá học — OnAir TMS" }] }),
  component: CourseDetail,
});

type Section = { id: string; course_id: string; org_id: string; title: string; description: string; sort_order: number; status: string };
type Lesson = { id: string; section_id: string; course_id: string; org_id: string; title: string; content: string; lesson_type: string; sort_order: number; status: string };

const lessonTypeLabel: Record<string, { label: string; icon: typeof FileText }> = {
  file: { label: "Tài liệu", icon: FileText },
  video: { label: "Video", icon: Video },
  assessment: { label: "Bài kiểm tra", icon: ListChecks },
};

function CourseDetail() {
  const { id: courseId } = Route.useParams();
  const navigate = useNavigate();
  const { orgId } = useOrg();
  const qc = useQueryClient();

  const course = useQuery({
    queryKey: ["online_courses", courseId],
    queryFn: async () => {
      const { data, error } = await supabase.from("online_courses").select("*").eq("id", courseId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const sections = useQuery({
    queryKey: ["course_sections", courseId],
    queryFn: async () => {
      const { data, error } = await supabase.from("course_sections").select("*").eq("course_id", courseId).order("sort_order");
      if (error) throw error;
      return (data ?? []) as Section[];
    },
  });

  const lessons = useQuery({
    queryKey: ["course_lessons", courseId],
    queryFn: async () => {
      const { data, error } = await supabase.from("course_lessons").select("*").eq("course_id", courseId).order("sort_order");
      if (error) throw error;
      return (data ?? []) as Lesson[];
    },
  });

  const inv = () => {
    qc.invalidateQueries({ queryKey: ["course_sections", courseId] });
    qc.invalidateQueries({ queryKey: ["course_lessons", courseId] });
    qc.invalidateQueries({ queryKey: ["online_courses"] });
  };

  // ===== Section dialog state =====
  const [secOpen, setSecOpen] = useState(false);
  const [secEdit, setSecEdit] = useState<Section | null>(null);
  const [secForm, setSecForm] = useState({ title: "", description: "" });
  const openSec = (s: Section | null) => { setSecEdit(s); setSecForm({ title: s?.title ?? "", description: s?.description ?? "" }); setSecOpen(true); };
  const saveSec = async () => {
    if (!secForm.title.trim()) { toast.error("Tiêu đề không bỏ trống"); return; }
    if (secEdit) {
      const { error } = await supabase.from("course_sections").update({ title: secForm.title, description: secForm.description }).eq("id", secEdit.id);
      if (error) return toast.error(error.message);
      toast.success("Đã cập nhật học phần");
    } else {
      const { error } = await supabase.from("course_sections").insert({
        course_id: courseId, org_id: orgId, title: secForm.title, description: secForm.description, sort_order: (sections.data?.length ?? 0),
      });
      if (error) return toast.error(error.message);
      toast.success("Đã thêm học phần");
    }
    setSecOpen(false); inv();
  };

  // ===== Lesson dialog state =====
  const [lesOpen, setLesOpen] = useState(false);
  const [lesEdit, setLesEdit] = useState<Lesson | null>(null);
  const [lesForm, setLesForm] = useState<{ title: string; content: string; lesson_type: string; section_id: string }>({ title: "", content: "", lesson_type: "file", section_id: "" });
  const openLes = (sectionId: string, l: Lesson | null) => {
    setLesEdit(l);
    setLesForm({ title: l?.title ?? "", content: l?.content ?? "", lesson_type: l?.lesson_type ?? "file", section_id: l?.section_id ?? sectionId });
    setLesOpen(true);
  };
  const saveLes = async () => {
    if (!lesForm.title.trim()) { toast.error("Tiêu đề không bỏ trống"); return; }
    if (lesEdit) {
      const { error } = await supabase.from("course_lessons").update({ title: lesForm.title, content: lesForm.content, lesson_type: lesForm.lesson_type }).eq("id", lesEdit.id);
      if (error) return toast.error(error.message);
      toast.success("Đã cập nhật bài học");
    } else {
      const count = (lessons.data ?? []).filter((x) => x.section_id === lesForm.section_id).length;
      const { error } = await supabase.from("course_lessons").insert({
        section_id: lesForm.section_id, course_id: courseId, org_id: orgId,
        title: lesForm.title, content: lesForm.content, lesson_type: lesForm.lesson_type, sort_order: count,
      });
      if (error) return toast.error(error.message);
      // bump lessons_count
      await supabase.from("online_courses").update({ lessons_count: (lessons.data?.length ?? 0) + 1 }).eq("id", courseId);
      toast.success("Đã thêm bài học");
    }
    setLesOpen(false); inv();
  };

  // ===== Deletion =====
  const [delSecId, setDelSecId] = useState<string | null>(null);
  const [delLesId, setDelLesId] = useState<string | null>(null);
  const removeSec = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("course_sections").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Đã xoá học phần"); inv(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const removeLes = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("course_lessons").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Đã xoá bài học"); inv(); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (course.isLoading) return <PageContainer title="Đang tải..." breadcrumbs={[{ title: "Khoá học", path: "/admin/online-course" }]}><div /></PageContainer>;
  if (!course.data) return <PageContainer title="Không tìm thấy" breadcrumbs={[{ title: "Khoá học", path: "/admin/online-course" }]}><div className="text-muted-foreground">Khoá học không tồn tại.</div></PageContainer>;

  const c = course.data;

  return (
    <PageContainer
      title={c.title}
      breadcrumbs={[{ title: "Đào tạo" }, { title: "Khoá học", path: "/admin/online-course" }, { title: c.code }]}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate({ to: "/admin/online-course" })}><ArrowLeft className="h-4 w-4" />Quay lại</Button>
          <Button size="sm" asChild><Link to="/admin/online-course/$id/edit" params={{ id: courseId }}><Pencil className="h-4 w-4" />Chỉnh sửa</Link></Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Thông tin khoá học</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="h-28 w-44 overflow-hidden rounded bg-muted shrink-0">
                {c.cover_url ? <img src={c.cover_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><BookOpen className="h-8 w-8" /></div>}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{c.code}</Badge>
                  <Badge>{c.category || "Chung"}</Badge>
                  {c.is_required && <Badge className="bg-amber-500">Bắt buộc</Badge>}
                  <Badge className={c.status === "published" ? "bg-emerald-500" : "bg-muted text-muted-foreground"}>
                    {c.status === "published" ? "Đã xuất bản" : c.status === "draft" ? "Nháp" : "Ngừng"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{c.description || "Chưa có mô tả."}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Thống kê</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><div className="text-2xl font-semibold">{sections.data?.length ?? 0}</div><div className="text-xs text-muted-foreground">Học phần</div></div>
            <div><div className="text-2xl font-semibold">{lessons.data?.length ?? 0}</div><div className="text-xs text-muted-foreground">Bài học</div></div>
            <div><div className="text-2xl font-semibold">{c.students_count}</div><div className="text-xs text-muted-foreground">Học viên</div></div>
            <div><div className="text-2xl font-semibold">{c.duration_minutes}</div><div className="text-xs text-muted-foreground">Phút</div></div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Học phần &amp; bài học</CardTitle>
          <Button size="sm" onClick={() => openSec(null)}><Plus className="h-4 w-4" />Thêm học phần</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(sections.data ?? []).length === 0 && (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              Chưa có học phần nào. Bấm "Thêm học phần" để bắt đầu.
            </div>
          )}
          {(sections.data ?? []).map((s, idx) => {
            const items = (lessons.data ?? []).filter((l) => l.section_id === s.id);
            return (
              <div key={s.id} className="rounded-lg border">
                <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-mono text-muted-foreground">#{idx + 1}</span>
                    <div>
                      <div className="font-medium">{s.title}</div>
                      {s.description && <div className="text-xs text-muted-foreground">{s.description}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" onClick={() => openLes(s.id, null)}><Plus className="h-3.5 w-3.5" />Bài học</Button>
                    <Button size="icon" variant="ghost" onClick={() => openSec(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setDelSecId(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="divide-y">
                  {items.length === 0 && <div className="px-4 py-3 text-xs text-muted-foreground">Chưa có bài học.</div>}
                  {items.map((l, li) => {
                    const T = lessonTypeLabel[l.lesson_type] ?? lessonTypeLabel.file;
                    const Icon = T.icon;
                    return (
                      <div key={l.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono text-muted-foreground w-8">{idx + 1}.{li + 1}</span>
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{l.title}</span>
                          <Badge variant="outline" className="text-[10px]">{T.label}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openLes(s.id, l)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setDelLesId(l.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Section dialog */}
      <Dialog open={secOpen} onOpenChange={setSecOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{secEdit ? "Cập nhật học phần" : "Thêm học phần"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5"><Label>Tiêu đề <span className="text-destructive">*</span></Label><Input value={secForm.title} onChange={(e) => setSecForm((p) => ({ ...p, title: e.target.value }))} /></div>
            <div className="grid gap-1.5"><Label>Mô tả</Label><Textarea rows={3} value={secForm.description} onChange={(e) => setSecForm((p) => ({ ...p, description: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSecOpen(false)}>Huỷ</Button>
            <Button onClick={saveSec}>{secEdit ? "Cập nhật" : "Thêm"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson dialog */}
      <Dialog open={lesOpen} onOpenChange={setLesOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lesEdit ? "Cập nhật bài học" : "Thêm bài học"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5"><Label>Tiêu đề <span className="text-destructive">*</span></Label><Input value={lesForm.title} onChange={(e) => setLesForm((p) => ({ ...p, title: e.target.value }))} /></div>
            <div className="grid gap-1.5">
              <Label>Loại bài học</Label>
              <Select value={lesForm.lesson_type} onValueChange={(v) => setLesForm((p) => ({ ...p, lesson_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="file">Tài liệu</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="assessment">Bài kiểm tra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Nội dung / URL</Label><Textarea rows={4} value={lesForm.content} onChange={(e) => setLesForm((p) => ({ ...p, content: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLesOpen(false)}>Huỷ</Button>
            <Button onClick={saveLes}>{lesEdit ? "Cập nhật" : "Thêm"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={!!delSecId} onOpenChange={(v) => !v && setDelSecId(null)} onConfirm={async () => { if (delSecId) { await removeSec.mutateAsync(delSecId); setDelSecId(null); } }} />
      <ConfirmDelete open={!!delLesId} onOpenChange={(v) => !v && setDelLesId(null)} onConfirm={async () => { if (delLesId) { await removeLes.mutateAsync(delLesId); setDelLesId(null); } }} />
    </PageContainer>
  );
}
