import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Layers, Save, X, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CourseInfoForm, type CourseInfo } from "@/components/admin/CourseInfoForm";
import { SectionsLessonsEditor, type EditorSection, type EditorLesson } from "@/components/admin/SectionsLessonsEditor";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { useOnlineCourses, useCertificates } from "@/lib/data-hooks";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/online-course/$id/editor")({
  head: () => ({ meta: [{ title: "Chỉnh sửa khoá học — OnAir TMS" }] }),
  component: CourseEditor,
});

const empty: CourseInfo = {
  code: "", title: "", description: "", category: "", duration_minutes: 0,
  cover_url: "", author_id: null, author_name: "", status: "draft",
};

function CourseEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { orgId } = useOrg();
  const qc = useQueryClient();
  const { data: allCourses = [] } = useOnlineCourses();

  const [tab, setTab] = useState<"info" | "content">("info");
  const [info, setInfo] = useState<CourseInfo>(empty);
  const [certificateId, setCertificateId] = useState<string>("");
  const [sections, setSections] = useState<EditorSection[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { data: certificates = [] } = useCertificates();

  const existing = useQuery({
    queryKey: ["online_courses", id],
    enabled: !isNew,
    queryFn: async () => {
      const [c, secs, less] = await Promise.all([
        supabase.from("online_courses").select("*").eq("id", id).maybeSingle(),
        supabase.from("course_sections").select("*").eq("course_id", id).order("sort_order"),
        supabase.from("course_lessons").select("*").eq("course_id", id).order("sort_order"),
      ]);
      if (c.error) throw c.error;
      return { course: c.data, sections: secs.data ?? [], lessons: less.data ?? [] };
    },
  });

  useEffect(() => {
    if (!existing.data?.course) return;
    const c = existing.data.course;
    setInfo({
      code: c.code, title: c.title, description: c.description, category: c.category,
      duration_minutes: c.duration_minutes, cover_url: c.cover_url,
      author_id: c.author_id, author_name: c.author_name, status: c.status,
    });
    setCertificateId((c as any).certificate_id || "");
    const secs: EditorSection[] = existing.data.sections.map((s) => ({
      id: s.id, title: s.title, description: s.description, sort_order: s.sort_order,
      lessons: existing.data.lessons.filter((l) => l.section_id === s.id).map((l) => ({
        id: l.id, title: l.title, description: l.description ?? "",
        lesson_type: (l.lesson_type as EditorLesson["lesson_type"]) ?? "video",
        content_url: l.content_url ?? "",
        content_meta: (l.content_meta as Record<string, unknown>) ?? {},
        quiz_assignment_id: l.quiz_assignment_id, duration_seconds: l.duration_seconds ?? 0,
        sort_order: l.sort_order,
      })),
    }));
    setSections(secs);
  }, [existing.data]);

  const cats = useMemo(() => Array.from(new Set(allCourses.map((c) => c.category).filter(Boolean))), [allCourses]);

  const handleInfoChange = (v: CourseInfo) => { setInfo(v); setDirty(true); };
  const handleSecChange = (s: EditorSection[]) => { setSections(s); setDirty(true); };

  const validate = () => {
    if (!info.title.trim()) { toast.error("Tên khóa học không được trống"); setTab("info"); return false; }
    if (info.title.length > 200) { toast.error("Tên khóa học tối đa 200 ký tự"); setTab("info"); return false; }
    if (!info.code.trim()) { toast.error("Mã khóa học không được trống"); setTab("info"); return false; }
    const dup = allCourses.find((c) => c.title.trim().toLowerCase() === info.title.trim().toLowerCase() && c.id !== id);
    if (dup) { toast.error("Tên khóa học đã tồn tại"); setTab("info"); return false; }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
      const coursePayload = {
        ...info, lessons_count: totalLessons, org_id: orgId,
      };

      let courseId = id;
      if (isNew) {
        const { data, error } = await supabase.from("online_courses").insert(coursePayload).select("id").single();
        if (error) throw error;
        courseId = data.id;
      } else {
        const { error } = await supabase.from("online_courses").update(coursePayload).eq("id", id);
        if (error) throw error;
      }

      // Replace sections + lessons (simple approach)
      if (!isNew) {
        await supabase.from("course_lessons").delete().eq("course_id", courseId);
        await supabase.from("course_sections").delete().eq("course_id", courseId);
      }
      for (const sec of sections) {
        const { data: secRow, error: secErr } = await supabase.from("course_sections").insert({
          org_id: orgId, course_id: courseId,
          title: sec.title, description: sec.description, sort_order: sec.sort_order, status: "active",
        }).select("id").single();
        if (secErr) throw secErr;
        if (sec.lessons.length) {
          const lessonRows = sec.lessons.map((l) => ({
            org_id: orgId, course_id: courseId, section_id: secRow.id,
            title: l.title, description: l.description, lesson_type: l.lesson_type,
            content_url: l.content_url, content_meta: l.content_meta as never,
            quiz_assignment_id: l.quiz_assignment_id, duration_seconds: l.duration_seconds,
            sort_order: l.sort_order, status: "active",
          }));
          const { error: lesErr } = await supabase.from("course_lessons").insert(lessonRows);
          if (lesErr) throw lesErr;
        }
      }

      // Audit log
      await supabase.from("course_audit_logs").insert({
        org_id: orgId, course_id: courseId,
        action: isNew ? "create" : "update",
        changes: { title: info.title },
      });

      qc.invalidateQueries({ queryKey: ["online_courses"] });
      qc.invalidateQueries({ queryKey: ["course_sections"] });
      qc.invalidateQueries({ queryKey: ["course_lessons"] });
      toast.success(isNew ? "Đã tạo khóa học" : "Đã cập nhật khóa học");
      setDirty(false);
      navigate({ to: "/admin/online-course" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setSaving(false); }
  };

  const onCancel = () => {
    if (dirty && !confirm("Bạn có dữ liệu chưa lưu. Rời khỏi trang?")) return;
    navigate({ to: "/admin/online-course" });
  };

  return (
    <PageContainer
      title={isNew ? "Tạo khóa học" : "Chỉnh sửa khóa học"}
      breadcrumbs={[{ title: "Quản lý khóa học", path: "/admin/online-course" }, { title: isNew ? "Tạo khóa học" : "Chỉnh sửa" }]}
      actions={
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="h-4 w-4" /></Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isNew ? "Đăng tải" : "Lưu thay đổi"}
          </Button>
        </div>
      }
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as "info" | "content")} className="space-y-4">
        <TabsList>
          <TabsTrigger value="info"><BookOpen className="h-4 w-4 mr-1" />Thông tin khóa học</TabsTrigger>
          <TabsTrigger value="content"><Layers className="h-4 w-4 mr-1" />Nội dung khóa học</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="p-6">
            <CourseInfoForm value={info} onChange={handleInfoChange} categories={cats} />
            <div className="mt-6 flex justify-between border-t pt-4">
              <Button variant="outline" onClick={onCancel}><ArrowLeft className="h-4 w-4 mr-1" />Quay lại</Button>
              <Button onClick={() => setTab("content")}>Tiếp tục</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card className="p-6">
            <SectionsLessonsEditor sections={sections} onChange={handleSecChange} />
            <div className="mt-6 flex justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setTab("info")}><ArrowLeft className="h-4 w-4 mr-1" />Quay lại</Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isNew ? "Đăng tải" : "Lưu thay đổi"}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
