import { createFileRoute, useNavigate, Link, useBlocker } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Plus, Trash2, Image as ImageIcon, X, Check, Search, UploadCloud,
  Info, Layers, Users, GripVertical,
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
  useLpSettings, useLpAudience, useOnlineCourses, useAssignments, useEmployees, useDepartments, useBranches,
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
  sequential_courses: boolean;
  courses: { _key: string; course_id: string }[];
  assignments: { _key: string; assignment_id: string; required: boolean }[];
};
type AudienceDraft = { _key: string; target_type: "all" | "user" | "department" | "branch"; target_id: string | null };

const newKey = () => Math.random().toString(36).slice(2);

const STEPS = [
  { n: 1, label: "Thông tin lộ trình", icon: Info },
  { n: 2, label: "Giai đoạn học tập", icon: Layers },
  { n: 3, label: "Gán học viên", icon: Users },
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
  const [settings, setSettings] = useState({ sequential_mode: false, completion_threshold: 80, deadline_days: null as number | null, allow_retake: false });
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
      sequential_courses: false,
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

  const addStage = () => { setStages(s => [...s, { _key: newKey(), name: "", description: "", stage_order: s.length, start_date: null, end_date: null, sequential_courses: false, courses: [], assignments: [] }]); markDirty(); };
  const removeStage = (key: string) => { setStages(s => s.filter(x => x._key !== key).map((x, i) => ({ ...x, stage_order: i }))); markDirty(); };
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
      if (!meta.title.trim()) return "Vui lòng nhập tên lộ trình";
      if (!meta.code.trim()) {
        // auto-generate code if empty
      }
      const dup = paths.find(p => p.id !== id && p.title.trim().toLowerCase() === meta.title.trim().toLowerCase());
      if (dup) return "Tên lộ trình đã tồn tại";
      if (settings.completion_threshold < 80 || settings.completion_threshold > 100) return "Tiêu chí hoàn thành phải từ 80-100%";
    }
    if (n >= 2) {
      if (stages.length === 0) return "Cần ít nhất 1 giai đoạn";
      for (const st of stages) {
        if (!st.name.trim()) return "Vui lòng đặt tên cho tất cả giai đoạn";
        if (st.courses.length === 0) return `Giai đoạn "${st.name}" cần ít nhất 1 khóa học`;
      }
    }
    return null;
  }

  async function publish() {
    const err = validateStep(2);
    if (err) { toast.error(err); return; }
    setSaving(true);
    try {
      const totalCourses = stages.reduce((s, st) => s + st.courses.length, 0);
      const code = meta.code.trim() || `LP-${Date.now().toString(36).toUpperCase()}`;
      const parsed = learningPathSchema.parse({ ...meta, code });
      let lpId = isNew ? null : id;

      if (isNew) {
        const { data: ins, error } = await supabase.from("learning_paths").insert({
          ...parsed, org_id: orgId, courses_count: totalCourses, students_count: 0, version: 1,
          status: "active", published_at: new Date().toISOString(),
        } as never).select("id").single();
        if (error) throw error;
        lpId = (ins as { id: string }).id;
      } else {
        const { error } = await supabase.from("learning_paths").update({
          ...parsed, courses_count: totalCourses,
          status: "active", published_at: new Date().toISOString(),
          version: (path?.version ?? 1) + 1,
        } as never).eq("id", id);
        if (error) throw error;
      }
      if (!lpId) throw new Error("missing id");

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

      await supabase.from("learning_path_versions").insert({
        org_id: orgId, learning_path_id: lpId,
        version: (path?.version ?? 1) + (isNew ? 0 : 1),
        snapshot: { meta: parsed, stages, settings, audience }, change_note: "Phát hành lộ trình",
      } as never);

      setDirty(false);
      toast.success("Đã đăng tải lộ trình");
      navigate({ to: "/admin/learning-paths/$id", params: { id: lpId } });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
    } finally { setSaving(false); }
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

  return (
    <PageContainer
      title={isNew ? "Tạo lộ trình học tập" : `Chỉnh sửa: ${path?.title}`}
      breadcrumbs={[{ title: "Lộ trình học tập", path: "/admin/learning-paths" }, { title: isNew ? "Tạo lộ trình học tập" : "Chỉnh sửa" }]}
    >
      <div className="flex justify-end gap-2 mb-2">
        <Button variant="outline" onClick={() => navigate({ to: "/admin/learning-paths" })}>Hủy</Button>
        {step < STEPS.length ? (
          <Button onClick={goNext} className="bg-blue-600 hover:bg-blue-700">Tiếp tục</Button>
        ) : (
          <Button onClick={publish} disabled={saving || locked} className="bg-blue-600 hover:bg-blue-700">Đăng tải</Button>
        )}
      </div>

      {/* Horizontal stepper */}
      <div className="flex items-center justify-center gap-2 py-4">
        {STEPS.map((s, i) => {
          const active = s.n === step;
          const done = s.n < step;
          const Icon = s.icon;
          return (
            <div key={s.n} className="flex items-center gap-2">
              <button
                onClick={() => setStep(s.n)}
                className={`flex items-center gap-2 transition ${active || done ? "" : "opacity-60"}`}
              >
                <span className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  active ? "bg-blue-600 text-white"
                  : done ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-500"
                }`}>
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${
                  active ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-slate-700"
                }`}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <div className="w-16 h-px bg-slate-200" />}
            </div>
          );
        })}
      </div>

      {locked && (
        <Card className="border-amber-300 bg-amber-50 mb-3">
          <CardContent className="p-3 text-sm text-amber-800">Lộ trình đang bị khoá. Mở khoá trước khi chỉnh sửa.</CardContent>
        </Card>
      )}

      {step === 1 && <Step1Info meta={meta} setMeta={(m) => { setMeta(m); markDirty(); }} settings={settings} setSettings={(s) => { setSettings(s); markDirty(); }} uploading={uploading} onUpload={handleCoverUpload} />}
      {step === 2 && <Step2Stages stages={stages} stagesLoading={stagesLoading} isNew={isNew} addStage={addStage} removeStage={removeStage} updStage={updStage} courses={courses} assignments={assignments} />}
      {step === 3 && <Step3Audience audience={audience} setAudience={(a) => { setAudience(a); markDirty(); }} branches={branches} departments={departments} employees={employees} />}

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

// ============== Step 1: Info + Settings ==============

function Step1Info({ meta, setMeta, settings, setSettings, uploading, onUpload }: {
  meta: { code: string; title: string; description: string; category: string; duration_hours: number; cover_url: string; status: "inactive" | "active" | "locked" };
  setMeta: (m: typeof meta) => void;
  settings: { sequential_mode: boolean; completion_threshold: number; deadline_days: number | null; allow_retake: boolean };
  setSettings: (s: typeof settings) => void;
  uploading: boolean;
  onUpload: (f: File) => void;
}) {
  const enableDeadline = settings.deadline_days !== null;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* LEFT: info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded" />
            Thông tin lộ trình
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tên lộ trình *</Label>
            <Input className="mt-1 rounded-full" maxLength={200} value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} placeholder="Nhập tên lộ trình của bạn" />
          </div>
          <div>
            <Label>Mô tả</Label>
            <Textarea className="mt-1" rows={6} value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} placeholder="Viết mô tả về lộ trình của bạn" />
          </div>
          <div>
            <Label>Ảnh bìa</Label>
            <label className="mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-8 cursor-pointer hover:bg-slate-50 transition">
              {meta.cover_url ? (
                <div className="relative w-full max-w-md">
                  <img src={meta.cover_url} alt="" className="w-full rounded-lg object-cover aspect-video" />
                  <button type="button" onClick={(e) => { e.preventDefault(); setMeta({ ...meta, cover_url: "" }); }} className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <>
                  <UploadCloud className="h-10 w-10 text-blue-400 mb-2" />
                  <p className="text-sm font-medium text-slate-700">Tải ảnh lên</p>
                  <p className="text-xs text-slate-500 mt-1">(.png, .jpg, .jpeg)</p>
                  <p className="text-xs text-slate-400 mt-1">Kích thước hình ảnh 1600×900px</p>
                </>
              )}
              <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} disabled={uploading} />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* RIGHT: settings */}
      <div className="space-y-3">
        <SettingRow
          title="Học tuần tự theo thời gian"
          desc="Người học phải hoàn thành giai đoạn trước để mở khoá giai đoạn tiếp theo"
          checked={settings.sequential_mode}
          onChange={(v) => setSettings({ ...settings, sequential_mode: v })}
        />
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded" />
              <Label className="font-medium">Tiêu chí hoàn thành</Label>
            </div>
            <p className="text-xs text-slate-500">Tỉ lệ % bài học cần hoàn thành để tính hoàn thành lộ trình</p>
            <div className="relative">
              <Input type="number" min={80} max={100} value={settings.completion_threshold} onChange={(e) => setSettings({ ...settings, completion_threshold: Number(e.target.value) })} className="rounded-full pr-10" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded" />
                <div>
                  <Label className="font-medium">Bật deadline</Label>
                  <p className="text-xs text-slate-500 mt-0.5">Giới hạn thời gian hoàn thành lộ trình</p>
                </div>
              </div>
              <Switch checked={enableDeadline} onCheckedChange={(v) => setSettings({ ...settings, deadline_days: v ? 30 : null })} />
            </div>
            {enableDeadline && (
              <div className="flex items-center gap-2 mt-3">
                <Input type="number" min={1} value={settings.deadline_days ?? 30} onChange={(e) => setSettings({ ...settings, deadline_days: Number(e.target.value) })} className="max-w-[120px] rounded-full" />
                <span className="text-sm text-slate-500">ngày</span>
              </div>
            )}
          </CardContent>
        </Card>
        <SettingRow
          title="Cho phép học lại lộ trình"
          desc="Học viên có thể học lại sau khi hoàn thành lộ trình"
          checked={settings.allow_retake}
          onChange={(v) => setSettings({ ...settings, allow_retake: v })}
        />
      </div>
    </div>
  );
}

function SettingRow({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-2 flex-1">
          <span className="w-1 h-4 bg-blue-600 rounded mt-1" />
          <div>
            <Label className="font-medium">{title}</Label>
            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
          </div>
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
      </CardContent>
    </Card>
  );
}

// ============== Step 2: Stages with courses + assignments ==============

function Step2Stages({ stages, stagesLoading, isNew, addStage, removeStage, updStage, courses, assignments }: {
  stages: StageDraft[]; stagesLoading: boolean; isNew: boolean;
  addStage: () => void; removeStage: (k: string) => void;
  updStage: (k: string, p: Partial<StageDraft>) => void;
  courses: { id: string; title: string; instructor?: string; duration_minutes?: number; lessons_count?: number }[];
  assignments: { id: string; title: string }[];
}) {
  if (stagesLoading && !isNew) return <Skeleton className="h-40" />;
  return (
    <div className="space-y-4">
      {stages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Layers className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">Chưa có giai đoạn nào</p>
            <Button onClick={addStage} className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-1" />Thêm giai đoạn</Button>
          </CardContent>
        </Card>
      )}
      {stages.map((st, idx) => (
        <StageEditor key={st._key} stage={st} index={idx} updStage={updStage} removeStage={removeStage} courses={courses} assignments={assignments} />
      ))}
      {stages.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={addStage} className="rounded-full border-blue-300 text-blue-700 hover:bg-blue-50"><Plus className="h-4 w-4 mr-1" />Thêm giai đoạn</Button>
        </div>
      )}
    </div>
  );
}

function StageEditor({ stage: st, index: idx, updStage, removeStage, courses, assignments }: {
  stage: StageDraft; index: number;
  updStage: (k: string, p: Partial<StageDraft>) => void;
  removeStage: (k: string) => void;
  courses: { id: string; title: string; instructor?: string; duration_minutes?: number; lessons_count?: number }[];
  assignments: { id: string; title: string }[];
}) {
  const usedCourses = new Set(st.courses.map(c => c.course_id));
  const usedAssignments = new Set(st.assignments.map(a => a.assignment_id));
  const enableDeadline = st.start_date !== null || st.end_date !== null;
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-slate-400" />
          <span className="w-1 h-5 bg-blue-600 rounded" />
          <CardTitle className="text-base">Giai đoạn {idx + 1}</CardTitle>
        </div>
        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeStage(st._key)}><Trash2 className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Tên giai đoạn *</Label>
          <Input className="mt-1 rounded-full" value={st.name} onChange={(e) => updStage(st._key, { name: e.target.value })} placeholder="Nhập tên giai đoạn của bạn" />
        </div>
        <div>
          <Label>Mô tả</Label>
          <Textarea className="mt-1" rows={3} value={st.description} onChange={(e) => updStage(st._key, { description: e.target.value })} placeholder="Viết mô tả về giai đoạn học tập này" />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label className="text-sm">Học tuần tự các khóa học</Label>
          <Switch checked={st.sequential_courses} onCheckedChange={(v) => updStage(st._key, { sequential_courses: v })} />
        </div>

        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Thời gian hoàn thành giai đoạn</Label>
            <Switch checked={enableDeadline} onCheckedChange={(v) => updStage(st._key, v ? {} : { start_date: null, end_date: null })} />
          </div>
          {enableDeadline && (
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Bắt đầu</Label><Input type="date" value={st.start_date ?? ""} onChange={(e) => updStage(st._key, { start_date: e.target.value || null })} /></div>
              <div><Label className="text-xs">Kết thúc</Label><Input type="date" value={st.end_date ?? ""} onChange={(e) => updStage(st._key, { end_date: e.target.value || null })} /></div>
            </div>
          )}
        </div>

        {/* Courses */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="font-medium">Khóa học trong giai đoạn *</Label>
            <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => updStage(st._key, { courses: [...st.courses, { _key: newKey(), course_id: courses.find(c => !usedCourses.has(c.id))?.id ?? "" }] })} disabled={courses.length === 0 || usedCourses.size >= courses.length}>
              <Plus className="h-4 w-4 mr-1" />Thêm khóa học
            </Button>
          </div>
          {st.courses.length === 0 ? (
            <div className="text-center text-sm text-slate-400 border rounded-lg py-6">Chưa có khóa học nào được chọn</div>
          ) : (
            <div className="space-y-2">
              {st.courses.map((c, ci) => {
                const co = courses.find(x => x.id === c.course_id);
                return (
                  <div key={c._key} className="flex items-center gap-2 p-2 rounded-lg border bg-slate-50">
                    <span className="text-xs w-6 text-slate-500 text-center">#{ci + 1}</span>
                    <div className="flex-1">
                      <Select value={c.course_id} onValueChange={(v) => updStage(st._key, { courses: st.courses.map(x => x._key === c._key ? { ...x, course_id: v } : x) })}>
                        <SelectTrigger><SelectValue placeholder="Chọn khóa học" /></SelectTrigger>
                        <SelectContent>{courses.map(co => <SelectItem key={co.id} value={co.id} disabled={usedCourses.has(co.id) && co.id !== c.course_id}>{co.title}</SelectItem>)}</SelectContent>
                      </Select>
                      {co && <p className="text-xs text-slate-500 mt-1 ml-1">{co.instructor || "—"} · {co.lessons_count ?? 0} bài · {co.duration_minutes ?? 0} phút</p>}
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => updStage(st._key, { courses: st.courses.filter(x => x._key !== c._key) })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Assignments */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="font-medium">Bài kiểm tra</Label>
            <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => updStage(st._key, { assignments: [...st.assignments, { _key: newKey(), assignment_id: assignments.find(a => !usedAssignments.has(a.id))?.id ?? "", required: true }] })} disabled={assignments.length === 0 || usedAssignments.size >= assignments.length}>
              <Plus className="h-4 w-4 mr-1" />Thêm bài kiểm tra
            </Button>
          </div>
          {st.assignments.length === 0 ? (
            <div className="text-center text-sm text-slate-400 border rounded-lg py-6">Chưa có bài kiểm tra nào được chọn</div>
          ) : (
            <div className="space-y-2">
              {st.assignments.map(a => (
                <div key={a._key} className="flex items-center gap-2 p-2 rounded-lg border bg-slate-50">
                  <Select value={a.assignment_id} onValueChange={(v) => updStage(st._key, { assignments: st.assignments.map(x => x._key === a._key ? { ...x, assignment_id: v } : x) })}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Chọn bài kiểm tra" /></SelectTrigger>
                    <SelectContent>{assignments.map(as => <SelectItem key={as.id} value={as.id} disabled={usedAssignments.has(as.id) && as.id !== a.assignment_id}>{as.title}</SelectItem>)}</SelectContent>
                  </Select>
                  <label className="flex items-center gap-2 text-xs whitespace-nowrap">
                    <Switch checked={a.required} onCheckedChange={(v) => updStage(st._key, { assignments: st.assignments.map(x => x._key === a._key ? { ...x, required: v } : x) })} />
                    Bắt buộc
                  </label>
                  <Button size="icon" variant="ghost" onClick={() => updStage(st._key, { assignments: st.assignments.filter(x => x._key !== a._key) })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============== Step 3: Assign learners (two columns) ==============

function Step3Audience({ audience, setAudience, branches, departments, employees }: {
  audience: AudienceDraft[];
  setAudience: (a: AudienceDraft[]) => void;
  branches: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  employees: { id: string; name: string; email: string; employee_code: string; department: string; branch: string }[];
}) {
  const [search, setSearch] = useState("");
  const [filterBranch, setFilterBranch] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [searchField, setSearchField] = useState<"name" | "email" | "code">("name");
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const isAll = audience.some(a => a.target_type === "all");
  const userIds = useMemo(() => new Set(audience.filter(a => a.target_type === "user" && a.target_id).map(a => a.target_id!)), [audience]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter(e => {
      if (filterBranch !== "all" && e.branch !== filterBranch) return false;
      if (filterDept !== "all" && e.department !== filterDept) return false;
      if (!q) return true;
      const v = searchField === "name" ? e.name : searchField === "email" ? e.email : e.employee_code;
      return (v ?? "").toLowerCase().includes(q);
    });
  }, [employees, search, searchField, filterBranch, filterDept]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleUser(uid: string, checked: boolean) {
    if (isAll) setAudience([]);
    if (checked) setAudience([...audience.filter(a => a.target_type !== "all"), { _key: newKey(), target_type: "user", target_id: uid }]);
    else setAudience(audience.filter(a => !(a.target_type === "user" && a.target_id === uid)));
  }
  function togglePageAll(checked: boolean) {
    if (checked) {
      const toAdd = pageItems.filter(e => !userIds.has(e.id)).map(e => ({ _key: newKey(), target_type: "user" as const, target_id: e.id }));
      setAudience([...audience.filter(a => a.target_type !== "all"), ...toAdd]);
    } else {
      const ids = new Set(pageItems.map(e => e.id));
      setAudience(audience.filter(a => !(a.target_type === "user" && a.target_id && ids.has(a.target_id))));
    }
  }
  const selectedEmployees = employees.filter(e => userIds.has(e.id));
  const allPageSelected = pageItems.length > 0 && pageItems.every(e => userIds.has(e.id));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded" />
            Tất cả học viên ({employees.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Checkbox checked={allPageSelected} onCheckedChange={(c) => togglePageAll(!!c)} />
            <Select value={searchField} onValueChange={(v) => setSearchField(v as "name" | "email" | "code")}>
              <SelectTrigger className="w-24 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Tên</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="code">Mã NV</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm kiếm..." className="pl-9 h-9" />
            </div>
            <Select value={filterBranch} onValueChange={(v) => { setFilterBranch(v); setPage(1); }}>
              <SelectTrigger className="h-9 w-32"><SelectValue placeholder="Chi nhánh" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mọi chi nhánh</SelectItem>
                {branches.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterDept} onValueChange={(v) => { setFilterDept(v); setPage(1); }}>
              <SelectTrigger className="h-9 w-32"><SelectValue placeholder="Phòng ban" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mọi phòng ban</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto">
            {pageItems.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Không có học viên phù hợp</p>
            ) : pageItems.map(e => (
              <label key={e.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <Checkbox checked={userIds.has(e.id)} onCheckedChange={(c) => toggleUser(e.id, !!c)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{e.employee_code || "—"}</Badge>
                    <span className="text-sm font-medium">{e.name}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {e.email} {e.department && <>· {e.department}</>}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-slate-500">Hiển thị {pageItems.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + pageItems.length} / {filtered.length}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</Button>
              <span className="text-sm px-3 py-1">{page}/{totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded" />
            Học viên đã chọn ({selectedEmployees.length})
          </CardTitle>
          {selectedEmployees.length > 0 && (
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setAudience([])}>Xoá tất cả</Button>
          )}
        </CardHeader>
        <CardContent>
          {selectedEmployees.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-600">Đang trống</p>
              <p className="text-xs mt-1">Chưa có học viên nào được gán lộ trình này.</p>
              <p className="text-xs">Vui lòng thêm học viên.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[560px] overflow-y-auto">
              {selectedEmployees.map(e => (
                <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg border bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{e.employee_code || "—"}</Badge>
                      <span className="text-sm font-medium">{e.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{e.email} {e.department && <>· {e.department}</>}</div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => toggleUser(e.id, false)}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
