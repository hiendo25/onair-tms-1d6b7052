import { createFileRoute, useNavigate, Link, useBlocker } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Plus, Trash2, Save, Send, Image as ImageIcon, X, Check, ChevronLeft, ChevronRight,
  CircleDot, Search, Users, BookOpen, ClipboardList, Settings, Layers,
} from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import {
  useLearningPaths, useLpStages, useLpStageCourses, useLpStageAssignments,
  useLpSettings, useLpAudience, useOnlineCourses, useAssignments, useBranches, useDepartments, useEmployees,
} from "@/lib/data-hooks";
import { learningPathSchema } from "@/lib/admin-schemas";

export const Route = createFileRoute("/_app/admin/learning-paths/edit/$id")({
  head: () => ({ meta: [{ title: "Cấu hình lộ trình — OnAir TMS" }] }),
  component: EditLP,
});

type StageDraft = {
  id?: string;
  _key: string;
  name: string;
  description: string;
  stage_order: number;
  start_date: string | null;
  end_date: string | null;
  courses: { _key: string; course_id: string }[];
  assignments: { _key: string; assignment_id: string; required: boolean }[];
};
type AudienceDraft = { _key: string; target_type: "all" | "user" | "department" | "branch"; target_id: string | null };

const newKey = () => Math.random().toString(36).slice(2);

const STEPS = [
  { n: 1, label: "Thông tin lộ trình", sub: "Tên, mô tả, ảnh bìa", icon: BookOpen, required: true },
  { n: 2, label: "Đối tượng áp dụng", sub: "Học viên được gán", icon: Users, required: true },
  { n: 3, label: "Giai đoạn học tập", sub: "Cấu trúc các giai đoạn", icon: Layers, required: true },
  { n: 4, label: "Khóa học", sub: "Gán khóa học vào giai đoạn", icon: BookOpen, required: true },
  { n: 5, label: "Bài kiểm tra", sub: "Gán bài kiểm tra vào giai đoạn", icon: ClipboardList, required: false },
  { n: 6, label: "Thiết lập lộ trình", sub: "Quy tắc & deadline", icon: Settings, required: true },
];

function EditLP() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const { orgId } = useOrg();
  const navigate = useNavigate();

  const { data: paths = [], isLoading: pathsLoading } = useLearningPaths();
  const path = useMemo(() => paths.find(p => p.id === id), [paths, id]);

  const { data: stagesData = [], isLoading: stagesLoading } = useLpStages(isNew ? undefined : id);
  const stageIds = useMemo(() => stagesData.map(s => s.id), [stagesData]);
  const { data: stageCourses = [] } = useLpStageCourses(stageIds);
  const { data: stageAssignments = [] } = useLpStageAssignments(stageIds);
  const { data: settingsRows = [] } = useLpSettings(isNew ? undefined : id);
  const { data: audienceRows = [] } = useLpAudience(isNew ? undefined : id);

  const { data: courses = [] } = useOnlineCourses();
  const { data: assignments = [] } = useAssignments();
  const { data: branches = [] } = useBranches();
  const { data: departments = [] } = useDepartments();
  const { data: employees = [] } = useEmployees();

  const [step, setStep] = useState(1);
  const [meta, setMeta] = useState({ code: "", title: "", description: "", category: "", duration_hours: 0, cover_url: "", status: "inactive" as "inactive" | "active" | "locked" });
  const [stages, setStages] = useState<StageDraft[]>([]);
  const [audience, setAudience] = useState<AudienceDraft[]>([{ _key: newKey(), target_type: "all", target_id: null }]);
  const [settings, setSettings] = useState({ sequential_mode: false, completion_threshold: 100, deadline_days: null as number | null, allow_retake: true });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showLeaveAlert, setShowLeaveAlert] = useState(false);
  const [pendingNavigate, setPendingNavigate] = useState<(() => void) | null>(null);

  // Hydrate
  useEffect(() => {
    if (isNew || !path) return;
    setMeta({
      code: path.code, title: path.title, description: path.description ?? "",
      category: path.category ?? "", duration_hours: path.duration_hours ?? 0,
      cover_url: path.cover_url ?? "", status: path.status,
    });
  }, [path, isNew]);

  useEffect(() => {
    if (isNew || stagesData.length === 0) return;
    setStages(stagesData.map(s => ({
      id: s.id, _key: s.id,
      name: s.name, description: s.description, stage_order: s.stage_order,
      start_date: s.start_date, end_date: s.end_date,
      courses: stageCourses.filter(c => c.stage_id === s.id).sort((a, b) => a.course_order - b.course_order)
        .map(c => ({ _key: c.id, course_id: c.course_id })),
      assignments: stageAssignments.filter(a => a.stage_id === s.id)
        .map(a => ({ _key: a.id, assignment_id: a.assignment_id, required: a.required })),
    })));
  }, [stagesData, stageCourses, stageAssignments, isNew]);

  useEffect(() => {
    if (settingsRows[0]) {
      const s = settingsRows[0];
      setSettings({
        sequential_mode: s.sequential_mode, completion_threshold: s.completion_threshold,
        deadline_days: s.deadline_days, allow_retake: s.allow_retake,
      });
    }
  }, [settingsRows]);

  useEffect(() => {
    if (audienceRows.length > 0) {
      setAudience(audienceRows.map(a => ({ _key: a.id, target_type: a.target_type, target_id: a.target_id })));
    }
  }, [audienceRows]);

  // Block navigation if dirty
  useBlocker({
    shouldBlockFn: ({ next }) => {
      if (!dirty) return false;
      const cur = window.location.pathname;
      if (next.pathname === cur) return false;
      setShowLeaveAlert(true);
      setPendingNavigate(() => () => navigate({ to: next.pathname as never }));
      return true;
    },
    enableBeforeUnload: dirty,
  });

  const markDirty = () => setDirty(true);

  // Stage ops
  const addStage = () => { setStages(s => [...s, { _key: newKey(), name: `Giai đoạn ${s.length + 1}`, description: "", stage_order: s.length, start_date: null, end_date: null, courses: [], assignments: [] }]); markDirty(); };
  const removeStage = (key: string) => { setStages(s => s.filter(x => x._key !== key).map((x, i) => ({ ...x, stage_order: i }))); markDirty(); };
  const moveStage = (key: string, dir: -1 | 1) => {
    setStages(s => {
      const i = s.findIndex(x => x._key === key); if (i < 0) return s;
      const j = i + dir; if (j < 0 || j >= s.length) return s;
      const next = [...s]; [next[i], next[j]] = [next[j], next[i]];
      return next.map((x, k) => ({ ...x, stage_order: k }));
    });
    markDirty();
  };
  const updStage = (key: string, patch: Partial<StageDraft>) => { setStages(s => s.map(x => x._key === key ? { ...x, ...patch } : x)); markDirty(); };

  async function handleCoverUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) { toast.error("Ảnh tối đa 5MB"); return; }
    if (!["image/jpeg", "image/png"].includes(file.type)) { toast.error("Chỉ hỗ trợ JPG, PNG"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${orgId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("learning-path-covers").upload(filePath, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("learning-path-covers").getPublicUrl(filePath);
      setMeta(m => ({ ...m, cover_url: data.publicUrl }));
      markDirty();
      toast.success("Đã tải ảnh bìa");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Không thể tải ảnh");
    } finally { setUploading(false); }
  }

  function validateStep(n: number): string | null {
    if (n >= 1) {
      const parsed = learningPathSchema.safeParse(meta);
      if (!parsed.success) return parsed.error.errors[0]?.message ?? "Thông tin chưa hợp lệ";
      // Check duplicate name
      const dup = paths.find(p => p.id !== id && p.title.trim().toLowerCase() === meta.title.trim().toLowerCase());
      if (dup) return "Tên lộ trình đã tồn tại";
    }
    if (n >= 3) {
      if (stages.length === 0) return "Cần ít nhất 1 giai đoạn";
    }
    if (n >= 4) {
      for (const st of stages) {
        if (st.courses.length === 0) return `Giai đoạn "${st.name}" cần ít nhất 1 khóa học`;
        const ids = st.courses.map(c => c.course_id);
        if (new Set(ids).size !== ids.length) return `Giai đoạn "${st.name}" có khóa học trùng`;
      }
    }
    if (n >= 6) {
      if (settings.completion_threshold < 80 || settings.completion_threshold > 100) return "Ngưỡng hoàn thành phải từ 80-100%";
    }
    return null;
  }

  async function save(publish = false) {
    const err = validateStep(publish ? 6 : 1);
    if (err) { toast.error(err); return null; }
    setSaving(true);
    try {
      const totalCourses = stages.reduce((s, st) => s + st.courses.length, 0);
      const parsed = learningPathSchema.parse(meta);
      let lpId = isNew ? null : id;

      if (isNew) {
        const { data: ins, error } = await supabase.from("learning_paths").insert({
          ...parsed, org_id: orgId, courses_count: totalCourses, students_count: 0, version: 1,
          status: publish ? "active" : "inactive",
          published_at: publish ? new Date().toISOString() : null,
        } as never).select("id").single();
        if (error) throw error;
        lpId = (ins as { id: string }).id;
      } else {
        const { error } = await supabase.from("learning_paths").update({
          ...parsed, courses_count: totalCourses,
          ...(publish ? { status: "active", published_at: new Date().toISOString(), version: (path?.version ?? 1) + 1 } : {}),
        } as never).eq("id", id);
        if (error) throw error;
      }
      if (!lpId) throw new Error("missing id");

      // Replace stages
      if (!isNew) {
        const { error: delErr } = await supabase.from("learning_path_stages").delete().eq("learning_path_id", lpId);
        if (delErr) throw delErr;
      }
      for (const [si, st] of stages.entries()) {
        const { data: stIns, error: stErr } = await supabase.from("learning_path_stages").insert({
          org_id: orgId, learning_path_id: lpId, name: st.name, description: st.description,
          stage_order: si, start_date: st.start_date || null, end_date: st.end_date || null,
        } as never).select("id").single();
        if (stErr) throw stErr;
        const stageId = (stIns as { id: string }).id;
        if (st.courses.length > 0) {
          const { error } = await supabase.from("learning_path_stage_courses").insert(
            st.courses.map((c, ci) => ({ org_id: orgId, stage_id: stageId, course_id: c.course_id, course_order: ci })) as never
          );
          if (error) throw error;
        }
        if (st.assignments.length > 0) {
          const { error } = await supabase.from("learning_path_stage_assignments").insert(
            st.assignments.map(a => ({ org_id: orgId, stage_id: stageId, assignment_id: a.assignment_id, unlock_condition: "after_all_courses", required: a.required })) as never
          );
          if (error) throw error;
        }
      }

      const { error: setErr } = await supabase.from("learning_path_settings").upsert({
        org_id: orgId, learning_path_id: lpId,
        sequential_mode: settings.sequential_mode,
        completion_threshold: settings.completion_threshold,
        deadline_days: settings.deadline_days,
        allow_retake: settings.allow_retake,
      } as never, { onConflict: "learning_path_id" });
      if (setErr) throw setErr;

      if (!isNew) {
        const { error } = await supabase.from("learning_path_audience").delete().eq("learning_path_id", lpId);
        if (error) throw error;
      }
      if (audience.length > 0) {
        const { error } = await supabase.from("learning_path_audience").insert(
          audience.map(a => ({ org_id: orgId, learning_path_id: lpId, target_type: a.target_type, target_id: a.target_type === "all" ? null : a.target_id })) as never
        );
        if (error) throw error;
      }

      if (publish) {
        await supabase.from("learning_path_versions").insert({
          org_id: orgId, learning_path_id: lpId,
          version: (path?.version ?? 1) + (isNew ? 0 : 1),
          snapshot: { meta: parsed, stages, settings, audience }, change_note: "Phát hành lộ trình",
        } as never);
      }

      setDirty(false);
      toast.success(publish ? "Đã phát hành lộ trình" : "Đã lưu");
      return lpId;
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
      return null;
    } finally { setSaving(false); }
  }

  async function publishAndExit() {
    const lpId = await save(true);
    if (lpId) navigate({ to: "/admin/learning-paths/$id", params: { id: lpId } });
  }

  function goNext() {
    const err = validateStep(step);
    if (err) { toast.error(err); return; }
    if (step < STEPS.length) setStep(step + 1);
  }

  if (!isNew && pathsLoading) {
    return <PageContainer title="Đang tải..." breadcrumbs={[{ title: "Lộ trình", path: "/admin/learning-paths" }, { title: "Đang tải..." }]}><Skeleton className="h-96" /></PageContainer>;
  }
  if (!isNew && !path) {
    return <PageContainer title="Không tìm thấy lộ trình" breadcrumbs={[{ title: "Lộ trình", path: "/admin/learning-paths" }]}>
      <Button asChild variant="outline"><Link to="/admin/learning-paths"><ArrowLeft className="h-4 w-4" /> Quay lại</Link></Button>
    </PageContainer>;
  }
  const locked = path?.status === "locked";
  const hasLearners = (path?.students_count ?? 0) > 0;
  const progress = Math.round(((step - 1) / (STEPS.length - 1)) * 100);

  return (
    <PageContainer
      title={isNew ? "Tạo lộ trình học" : `Chỉnh sửa: ${path?.title}`}
      breadcrumbs={[{ title: "Lộ trình học tập", path: "/admin/learning-paths" }, { title: isNew ? "Tạo mới" : "Chỉnh sửa" }]}
    >
      {locked && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-3 text-sm text-amber-800">Lộ trình đang bị khoá. Mở khoá trước khi chỉnh sửa.</CardContent>
        </Card>
      )}
      {hasLearners && !isNew && (
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="p-3 text-sm text-blue-800">Lộ trình đã có {path?.students_count} học viên — không nên thay đổi cấu trúc giai đoạn/khóa học.</CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        {/* Sidebar stepper */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tiến trình thiết lập</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">{progress}%</Badge>
              </div>
              <div className="text-xs text-slate-500 mb-3">Bước {step} / {STEPS.length}</div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </CardContent>
          </Card>

          {STEPS.map((s) => {
            const active = s.n === step;
            const done = s.n < step;
            const Icon = s.icon;
            return (
              <button
                key={s.n}
                onClick={() => setStep(s.n)}
                className={`w-full text-left rounded-lg border p-3 transition ${
                  active ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                  : done ? "border-emerald-200 bg-white"
                  : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    active ? "bg-blue-600 text-white" : done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {done ? <Check className="h-3.5 w-3.5" /> : active ? <CircleDot className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900">{s.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right form */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Bước {step}</div>
                  <CardTitle className="text-xl">{STEPS[step - 1].label}</CardTitle>
                </div>
                {STEPS[step - 1].required && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Bắt buộc</Badge>}
              </div>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              {step === 1 && <Step1Info meta={meta} setMeta={(m) => { setMeta(m); markDirty(); }} uploading={uploading} onUpload={handleCoverUpload} />}
              {step === 2 && <Step2Audience audience={audience} setAudience={(a) => { setAudience(a); markDirty(); }} branches={branches} departments={departments} employees={employees} />}
              {step === 3 && <Step3Stages stages={stages} stagesLoading={stagesLoading} isNew={isNew} addStage={addStage} removeStage={removeStage} moveStage={moveStage} updStage={updStage} />}
              {step === 4 && <Step4Courses stages={stages} courses={courses} updStage={updStage} />}
              {step === 5 && <Step5Assignments stages={stages} assignments={assignments} updStage={updStage} />}
              {step === 6 && <Step6Settings settings={settings} setSettings={(s) => { setSettings(s); markDirty(); }} />}
            </CardContent>
          </Card>

          {/* Footer nav */}
          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
              <ChevronLeft className="h-4 w-4 mr-1" />Quay lại
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => save(false)} disabled={saving || locked}><Save className="h-4 w-4 mr-1" />Lưu nháp</Button>
              {step < STEPS.length ? (
                <Button onClick={goNext} className="bg-blue-600 hover:bg-blue-700">
                  Tiếp tục<ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={publishAndExit} disabled={saving || locked} className="bg-emerald-600 hover:bg-emerald-700">
                  <Send className="h-4 w-4 mr-1" />Phát hành
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showLeaveAlert} onOpenChange={setShowLeaveAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rời khỏi trang?</AlertDialogTitle>
            <AlertDialogDescription>Bạn có thay đổi chưa lưu. Tiếp tục sẽ huỷ toàn bộ thay đổi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingNavigate(null)}>Ở lại</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setDirty(false); pendingNavigate?.(); }}>Rời khỏi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

// ============== Step components ==============

function Step1Info({ meta, setMeta, uploading, onUpload }: {
  meta: { code: string; title: string; description: string; category: string; duration_hours: number; cover_url: string; status: "inactive" | "active" | "locked" };
  setMeta: (m: typeof meta) => void;
  uploading: boolean;
  onUpload: (f: File) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Mã lộ trình *</Label>
          <Input className="mt-1" value={meta.code} onChange={(e) => setMeta({ ...meta, code: e.target.value.toUpperCase() })} placeholder="VD: LP-AI-2026" />
        </div>
        <div>
          <Label>Tên lộ trình *</Label>
          <Input className="mt-1" maxLength={200} value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} placeholder="VD: Lộ trình đào tạo AI" />
        </div>
      </div>
      <div>
        <Label>Mô tả</Label>
        <Textarea className="mt-1" rows={4} value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} placeholder="Mục tiêu và nội dung của lộ trình..." />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Danh mục</Label>
          <Input className="mt-1" value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })} placeholder="VD: Kỹ năng mềm" />
        </div>
        <div>
          <Label>Thời lượng (giờ)</Label>
          <Input className="mt-1" type="number" min={0} value={meta.duration_hours} onChange={(e) => setMeta({ ...meta, duration_hours: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <Label>Ảnh bìa</Label>
        <p className="text-xs text-slate-500 mt-1 mb-2">JPG/PNG, tối đa 5MB. Khuyến nghị 1200×600px.</p>
        <div className="flex items-center gap-3">
          {meta.cover_url ? (
            <div className="relative h-24 w-40 rounded border overflow-hidden">
              <img src={meta.cover_url} alt="" className="h-full w-full object-cover" />
              <button onClick={() => setMeta({ ...meta, cover_url: "" })} className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white"><X className="h-3 w-3" /></button>
            </div>
          ) : (
            <div className="flex h-24 w-40 items-center justify-center rounded border border-dashed text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>
          )}
          <Input type="file" accept="image/jpeg,image/png" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} disabled={uploading} className="max-w-xs" />
        </div>
      </div>
    </div>
  );
}

function Step2Audience({ audience, setAudience, branches, departments, employees }: {
  audience: AudienceDraft[];
  setAudience: (a: AudienceDraft[]) => void;
  branches: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  employees: { id: string; name: string; email: string; employee_code: string; department: string; branch: string }[];
}) {
  const [search, setSearch] = useState("");
  const [filterBranch, setFilterBranch] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");

  const isAll = audience.some(a => a.target_type === "all");
  const userIds = useMemo(() => new Set(audience.filter(a => a.target_type === "user" && a.target_id).map(a => a.target_id!)), [audience]);
  const branchIds = useMemo(() => new Set(audience.filter(a => a.target_type === "branch" && a.target_id).map(a => a.target_id!)), [audience]);
  const deptIds = useMemo(() => new Set(audience.filter(a => a.target_type === "department" && a.target_id).map(a => a.target_id!)), [audience]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter(e => {
      if (filterBranch !== "all" && e.branch !== filterBranch) return false;
      if (filterDept !== "all" && e.department !== filterDept) return false;
      if (!q) return true;
      return [e.name, e.email, e.employee_code].some(v => (v ?? "").toLowerCase().includes(q));
    });
  }, [employees, search, filterBranch, filterDept]);

  function setAll(checked: boolean) {
    if (checked) setAudience([{ _key: newKey(), target_type: "all", target_id: null }]);
    else setAudience(audience.filter(a => a.target_type !== "all"));
  }
  function toggleUser(uid: string, checked: boolean) {
    if (isAll) return;
    if (checked) setAudience([...audience, { _key: newKey(), target_type: "user", target_id: uid }]);
    else setAudience(audience.filter(a => !(a.target_type === "user" && a.target_id === uid)));
  }
  function toggleBranch(bid: string, checked: boolean) {
    if (isAll) return;
    if (checked) setAudience([...audience, { _key: newKey(), target_type: "branch", target_id: bid }]);
    else setAudience(audience.filter(a => !(a.target_type === "branch" && a.target_id === bid)));
  }
  function toggleDept(did: string, checked: boolean) {
    if (isAll) return;
    if (checked) setAudience([...audience, { _key: newKey(), target_type: "department", target_id: did }]);
    else setAudience(audience.filter(a => !(a.target_type === "department" && a.target_id === did)));
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Gán toàn bộ học viên trong tổ chức</Label>
            <p className="text-xs text-slate-500 mt-0.5">Tất cả học viên hiện có và sẽ thêm vào hệ thống đều được gán.</p>
          </div>
          <Switch checked={isAll} onCheckedChange={setAll} />
        </CardContent>
      </Card>

      {!isAll && (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Theo chi nhánh ({branchIds.size})</CardTitle></CardHeader>
              <CardContent className="max-h-48 overflow-y-auto space-y-1">
                {branches.length === 0 && <p className="text-xs text-slate-500">Chưa có chi nhánh.</p>}
                {branches.map(b => (
                  <label key={b.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={branchIds.has(b.id)} onCheckedChange={(c) => toggleBranch(b.id, !!c)} />
                    <span>{b.name}</span>
                  </label>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Theo phòng ban ({deptIds.size})</CardTitle></CardHeader>
              <CardContent className="max-h-48 overflow-y-auto space-y-1">
                {departments.length === 0 && <p className="text-xs text-slate-500">Chưa có phòng ban.</p>}
                {departments.map(d => (
                  <label key={d.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={deptIds.has(d.id)} onCheckedChange={(c) => toggleDept(d.id, !!c)} />
                    <span>{d.name}</span>
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-sm">Cá nhân ({userIds.size})</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên, email, mã..." className="pl-7 h-8 w-56" />
                  </div>
                  <Select value={filterBranch} onValueChange={setFilterBranch}>
                    <SelectTrigger className="h-8 w-36"><SelectValue placeholder="Chi nhánh" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Mọi chi nhánh</SelectItem>
                      {branches.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filterDept} onValueChange={setFilterDept}>
                    <SelectTrigger className="h-8 w-36"><SelectValue placeholder="Phòng ban" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Mọi phòng ban</SelectItem>
                      {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="max-h-72 overflow-y-auto">
              {filteredEmployees.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">Không có học viên phù hợp</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-xs text-slate-500 sticky top-0 bg-white">
                    <tr><th className="w-8"></th><th className="text-left py-1">Mã NV</th><th className="text-left">Họ tên</th><th className="text-left">Email</th><th className="text-left">Phòng ban</th><th className="text-left">Chi nhánh</th></tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td><Checkbox checked={userIds.has(e.id)} onCheckedChange={(c) => toggleUser(e.id, !!c)} /></td>
                        <td className="py-1.5">{e.employee_code || "—"}</td>
                        <td>{e.name}</td>
                        <td className="text-slate-500">{e.email}</td>
                        <td className="text-slate-500">{e.department || "—"}</td>
                        <td className="text-slate-500">{e.branch || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Step3Stages({ stages, stagesLoading, isNew, addStage, removeStage, moveStage, updStage }: {
  stages: StageDraft[]; stagesLoading: boolean; isNew: boolean;
  addStage: () => void; removeStage: (k: string) => void; moveStage: (k: string, d: -1 | 1) => void;
  updStage: (k: string, p: Partial<StageDraft>) => void;
}) {
  if (stagesLoading && !isNew) return <Skeleton className="h-40" />;
  return (
    <div className="space-y-3">
      {stages.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <Layers className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Chưa có giai đoạn — thêm giai đoạn đầu tiên</p>
        </div>
      )}
      {stages.map((st, idx) => (
        <Card key={st._key}>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <Badge variant="outline">Giai đoạn {idx + 1}</Badge>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => moveStage(st._key, -1)} disabled={idx === 0}>↑</Button>
              <Button size="sm" variant="ghost" onClick={() => moveStage(st._key, 1)} disabled={idx === stages.length - 1}>↓</Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeStage(st._key)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div><Label>Tên giai đoạn</Label><Input value={st.name} onChange={(e) => updStage(st._key, { name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Bắt đầu</Label><Input type="date" value={st.start_date ?? ""} onChange={(e) => updStage(st._key, { start_date: e.target.value || null })} /></div>
                <div><Label>Kết thúc</Label><Input type="date" value={st.end_date ?? ""} onChange={(e) => updStage(st._key, { end_date: e.target.value || null })} /></div>
              </div>
            </div>
            <div><Label>Mô tả</Label><Textarea rows={2} value={st.description} onChange={(e) => updStage(st._key, { description: e.target.value })} /></div>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={addStage}><Plus className="h-4 w-4" /> Thêm giai đoạn</Button>
    </div>
  );
}

function Step4Courses({ stages, courses, updStage }: {
  stages: StageDraft[]; courses: { id: string; title: string; instructor?: string; duration_minutes?: number; lessons_count?: number }[];
  updStage: (k: string, p: Partial<StageDraft>) => void;
}) {
  if (stages.length === 0) return <p className="text-sm text-slate-500">Chưa có giai đoạn nào — quay lại bước trước để tạo.</p>;
  return (
    <div className="space-y-4">
      {stages.map((st, idx) => {
        const usedIds = new Set(st.courses.map(c => c.course_id));
        return (
          <Card key={st._key}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Giai đoạn {idx + 1}: {st.name}</CardTitle>
                <Badge variant="outline">{st.courses.length} khóa</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {st.courses.map((c, ci) => {
                const co = courses.find(x => x.id === c.course_id);
                return (
                  <div key={c._key} className="flex items-center gap-2 p-2 rounded border bg-slate-50">
                    <span className="text-xs w-6 text-slate-500">#{ci + 1}</span>
                    <div className="flex-1">
                      <Select value={c.course_id} onValueChange={(v) => updStage(st._key, { courses: st.courses.map(x => x._key === c._key ? { ...x, course_id: v } : x) })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{courses.map(co => <SelectItem key={co.id} value={co.id} disabled={usedIds.has(co.id) && co.id !== c.course_id}>{co.title}</SelectItem>)}</SelectContent>
                      </Select>
                      {co && <p className="text-xs text-slate-500 mt-1">{co.instructor || "—"} · {co.lessons_count ?? 0} bài · {co.duration_minutes ?? 0} phút</p>}
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => updStage(st._key, { courses: st.courses.filter(x => x._key !== c._key) })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                );
              })}
              <Button size="sm" variant="outline" onClick={() => updStage(st._key, { courses: [...st.courses, { _key: newKey(), course_id: courses.find(c => !usedIds.has(c.id))?.id ?? "" }] })} disabled={courses.length === 0 || usedIds.size >= courses.length}>
                <Plus className="h-4 w-4" /> Thêm khóa học
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Step5Assignments({ stages, assignments, updStage }: {
  stages: StageDraft[]; assignments: { id: string; title: string }[];
  updStage: (k: string, p: Partial<StageDraft>) => void;
}) {
  if (stages.length === 0) return <p className="text-sm text-slate-500">Chưa có giai đoạn nào.</p>;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Bài kiểm tra chỉ mở khi học viên hoàn thành 100% khóa học trong giai đoạn.</p>
      {stages.map((st, idx) => {
        const usedIds = new Set(st.assignments.map(a => a.assignment_id));
        return (
          <Card key={st._key}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Giai đoạn {idx + 1}: {st.name}</CardTitle>
                <Badge variant="outline">{st.assignments.length} bài</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {st.assignments.map(a => (
                <div key={a._key} className="flex items-center gap-2 p-2 rounded border bg-slate-50">
                  <Select value={a.assignment_id} onValueChange={(v) => updStage(st._key, { assignments: st.assignments.map(x => x._key === a._key ? { ...x, assignment_id: v } : x) })}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Chọn bài kiểm tra" /></SelectTrigger>
                    <SelectContent>{assignments.map(as => <SelectItem key={as.id} value={as.id} disabled={usedIds.has(as.id) && as.id !== a.assignment_id}>{as.title}</SelectItem>)}</SelectContent>
                  </Select>
                  <label className="flex items-center gap-2 text-xs whitespace-nowrap">
                    <Switch checked={a.required} onCheckedChange={(v) => updStage(st._key, { assignments: st.assignments.map(x => x._key === a._key ? { ...x, required: v } : x) })} />
                    Bắt buộc
                  </label>
                  <Button size="icon" variant="ghost" onClick={() => updStage(st._key, { assignments: st.assignments.filter(x => x._key !== a._key) })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => updStage(st._key, { assignments: [...st.assignments, { _key: newKey(), assignment_id: assignments.find(a => !usedIds.has(a.id))?.id ?? "", required: true }] })} disabled={assignments.length === 0 || usedIds.size >= assignments.length}>
                <Plus className="h-4 w-4" /> Thêm bài kiểm tra
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Step6Settings({ settings, setSettings }: {
  settings: { sequential_mode: boolean; completion_threshold: number; deadline_days: number | null; allow_retake: boolean };
  setSettings: (s: typeof settings) => void;
}) {
  const enableDeadline = settings.deadline_days !== null;
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <Label className="font-medium">Học tuần tự</Label>
            <p className="text-xs text-slate-500 mt-0.5">Học viên phải hoàn thành giai đoạn trước mới mở giai đoạn sau.</p>
          </div>
          <Switch checked={settings.sequential_mode} onCheckedChange={(v) => setSettings({ ...settings, sequential_mode: v })} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-2">
          <Label className="font-medium">Tiêu chí hoàn thành (%)</Label>
          <p className="text-xs text-slate-500">Tối thiểu 80%, tối đa 100%. Học viên đạt ngưỡng này sẽ được xem là hoàn thành lộ trình.</p>
          <Input type="number" min={80} max={100} value={settings.completion_threshold} onChange={(e) => setSettings({ ...settings, completion_threshold: Number(e.target.value) })} className="max-w-[120px]" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Thiết lập deadline</Label>
              <p className="text-xs text-slate-500 mt-0.5">Tính từ ngày học viên được gán vào lộ trình.</p>
            </div>
            <Switch checked={enableDeadline} onCheckedChange={(v) => setSettings({ ...settings, deadline_days: v ? 30 : null })} />
          </div>
          {enableDeadline && (
            <div className="flex items-center gap-2">
              <Input type="number" min={1} value={settings.deadline_days ?? 30} onChange={(e) => setSettings({ ...settings, deadline_days: Number(e.target.value) })} className="max-w-[120px]" />
              <span className="text-sm text-slate-500">ngày</span>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <Label className="font-medium">Cho phép học lại</Label>
            <p className="text-xs text-slate-500 mt-0.5">Học viên có thể reset tiến độ và học lại từ đầu.</p>
          </div>
          <Switch checked={settings.allow_retake} onCheckedChange={(v) => setSettings({ ...settings, allow_retake: v })} />
        </CardContent>
      </Card>
    </div>
  );
}
