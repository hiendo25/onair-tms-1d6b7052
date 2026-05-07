import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Send, Image as ImageIcon, X } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import {
  useLearningPaths, useLpStages, useLpStageCourses, useLpStageAssignments,
  useLpSettings, useLpAudience, useOnlineCourses, useAssignments, useBranches, useDepartments, useEmployees,
} from "@/lib/data-hooks";
import { learningPathSchema } from "@/lib/admin-schemas";
import { LP_AUDIENCE_TYPE, LP_UNLOCK_CONDITION } from "@/lib/admin-options";

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
  courses: { _key: string; id?: string; course_id: string; course_order: number }[];
  assignments: { _key: string; id?: string; assignment_id: string; unlock_condition: string; required: boolean }[];
};
type AudienceDraft = { _key: string; id?: string; target_type: "all" | "user" | "department" | "branch"; target_id: string | null };

const newKey = () => Math.random().toString(36).slice(2);

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

  // Form state
  const [meta, setMeta] = useState({ code: "", title: "", description: "", category: "", duration_hours: 0, cover_url: "", status: "inactive" as "inactive" | "active" | "locked" });
  const [stages, setStages] = useState<StageDraft[]>([]);
  const [audience, setAudience] = useState<AudienceDraft[]>([]);
  const [settings, setSettings] = useState({ sequential_mode: false, completion_threshold: 100, deadline_days: null as number | null, allow_retake: true });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("info");
  const [uploading, setUploading] = useState(false);

  // Hydrate from db
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
        .map(c => ({ _key: c.id, id: c.id, course_id: c.course_id, course_order: c.course_order })),
      assignments: stageAssignments.filter(a => a.stage_id === s.id)
        .map(a => ({ _key: a.id, id: a.id, assignment_id: a.assignment_id, unlock_condition: a.unlock_condition, required: a.required })),
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
    setAudience(audienceRows.map(a => ({ _key: a.id, id: a.id, target_type: a.target_type, target_id: a.target_id })));
  }, [audienceRows]);

  // Stage operations
  const addStage = () => setStages(s => [...s, { _key: newKey(), name: `Giai đoạn ${s.length + 1}`, description: "", stage_order: s.length, start_date: null, end_date: null, courses: [], assignments: [] }]);
  const removeStage = (key: string) => setStages(s => s.filter(x => x._key !== key).map((x, i) => ({ ...x, stage_order: i })));
  const moveStage = (key: string, dir: -1 | 1) => setStages(s => {
    const i = s.findIndex(x => x._key === key); if (i < 0) return s;
    const j = i + dir; if (j < 0 || j >= s.length) return s;
    const next = [...s]; [next[i], next[j]] = [next[j], next[i]];
    return next.map((x, k) => ({ ...x, stage_order: k }));
  });
  const updStage = (key: string, patch: Partial<StageDraft>) => setStages(s => s.map(x => x._key === key ? { ...x, ...patch } : x));

  async function handleCoverUpload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${orgId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("learning-path-covers").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("learning-path-covers").getPublicUrl(path);
      setMeta(m => ({ ...m, cover_url: data.publicUrl }));
      toast.success("Đã tải ảnh bìa");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Không thể tải ảnh";
      toast.error(msg);
    } finally { setUploading(false); }
  }

  async function save(publish = false) {
    const parsed = learningPathSchema.safeParse(meta);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      toast.error(first?.message ?? "Dữ liệu chưa hợp lệ");
      setTab("info"); return;
    }
    if (publish && stages.length === 0) {
      toast.error("Cần ít nhất 1 giai đoạn để xuất bản"); setTab("stages"); return;
    }
    setSaving(true);
    try {
      const totalCourses = stages.reduce((s, st) => s + st.courses.length, 0);

      let lpId = isNew ? null : id;
      if (isNew) {
        const { data: ins, error } = await supabase.from("learning_paths").insert({
          ...parsed.data, org_id: orgId, courses_count: totalCourses, students_count: 0, version: 1,
          status: publish ? "active" : "inactive",
          published_at: publish ? new Date().toISOString() : null,
        } as never).select("id").single();
        if (error) throw error;
        lpId = (ins as { id: string }).id;
      } else {
        const { error } = await supabase.from("learning_paths").update({
          ...parsed.data, courses_count: totalCourses,
          ...(publish ? { status: "active", published_at: new Date().toISOString(), version: (path?.version ?? 1) + (path?.published_at ? 1 : 0) } : {}),
        } as never).eq("id", id);
        if (error) throw error;
      }
      if (!lpId) throw new Error("missing id");

      // Replace stages: delete all then insert (simple but correct)
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
            st.assignments.map(a => ({ org_id: orgId, stage_id: stageId, assignment_id: a.assignment_id, unlock_condition: a.unlock_condition, required: a.required })) as never
          );
          if (error) throw error;
        }
      }

      // Settings (upsert by learning_path_id)
      const { error: setErr } = await supabase.from("learning_path_settings").upsert({
        org_id: orgId, learning_path_id: lpId,
        sequential_mode: settings.sequential_mode,
        completion_threshold: settings.completion_threshold,
        deadline_days: settings.deadline_days,
        allow_retake: settings.allow_retake,
      } as never, { onConflict: "learning_path_id" });
      if (setErr) throw setErr;

      // Audience: replace
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

      // Version snapshot
      if (publish) {
        await supabase.from("learning_path_versions").insert({
          org_id: orgId, learning_path_id: lpId,
          version: (path?.version ?? 1) + (isNew ? 0 : (path?.published_at ? 1 : 0)),
          snapshot: { meta: parsed.data, stages, settings, audience }, change_note: "Xuất bản",
        } as never);
      }

      toast.success(publish ? "Đã xuất bản lộ trình" : "Đã lưu nháp");
      navigate({ to: "/admin/learning-paths/$id", params: { id: lpId } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lưu thất bại";
      toast.error(msg);
    } finally { setSaving(false); }
  }

  if (!isNew && pathsLoading) {
    return <PageContainer title="Đang tải..."><Skeleton className="h-96" /></PageContainer>;
  }
  if (!isNew && !path) {
    return <PageContainer title="Không tìm thấy lộ trình">
      <Button asChild variant="outline"><Link to="/admin/learning-paths"><ArrowLeft className="h-4 w-4" /> Quay lại</Link></Button>
    </PageContainer>;
  }
  const locked = path?.status === "locked";

  return (
    <PageContainer
      title={isNew ? "Tạo lộ trình mới" : `Chỉnh sửa: ${path?.title}`}
      breadcrumbs={[{ title: "Lộ trình", path: "/admin/learning-paths" }, { title: isNew ? "Tạo mới" : "Chỉnh sửa" }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/learning-paths" })}>Huỷ</Button>
          <Button variant="outline" size="sm" onClick={() => save(false)} disabled={saving || locked}><Save className="h-4 w-4" /> Lưu nháp</Button>
          <Button size="sm" onClick={() => save(true)} disabled={saving || locked}><Send className="h-4 w-4" /> Xuất bản</Button>
        </div>
      }
    >
      {locked && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-3 text-sm text-amber-800">Lộ trình đang bị khoá. Mở khoá trước khi chỉnh sửa.</CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="stages">Giai đoạn ({stages.length})</TabsTrigger>
          <TabsTrigger value="audience">Đối tượng ({audience.length})</TabsTrigger>
          <TabsTrigger value="settings">Cấu hình</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Thông tin chung</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Mã lộ trình *</Label>
                <Input value={meta.code} onChange={(e) => setMeta({ ...meta, code: e.target.value.toUpperCase() })} placeholder="LP-MGR" />
              </div>
              <div>
                <Label>Tên lộ trình *</Label>
                <Input value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Mô tả</Label>
                <Textarea value={meta.description} rows={3} onChange={(e) => setMeta({ ...meta, description: e.target.value })} />
              </div>
              <div>
                <Label>Danh mục</Label>
                <Input value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })} />
              </div>
              <div>
                <Label>Thời lượng (giờ)</Label>
                <Input type="number" value={meta.duration_hours} onChange={(e) => setMeta({ ...meta, duration_hours: Number(e.target.value) })} />
              </div>
              <div className="md:col-span-2">
                <Label>Ảnh bìa</Label>
                <div className="flex items-center gap-3">
                  {meta.cover_url ? (
                    <div className="relative h-24 w-40 rounded border overflow-hidden">
                      <img src={meta.cover_url} alt="" className="h-full w-full object-cover" />
                      <button onClick={() => setMeta({ ...meta, cover_url: "" })} className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white"><X className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <div className="flex h-24 w-40 items-center justify-center rounded border border-dashed text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>
                  )}
                  <Input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }} disabled={uploading} className="max-w-xs" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages" className="space-y-3">
          {stagesLoading && !isNew ? <Skeleton className="h-40" /> : null}
          {stages.map((st, idx) => (
            <Card key={st._key}>
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">Giai đoạn {idx + 1}</Badge>
                </div>
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
                  <div className="md:col-span-2"><Label>Mô tả</Label><Textarea rows={2} value={st.description} onChange={(e) => updStage(st._key, { description: e.target.value })} /></div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Khoá học ({st.courses.length})</Label>
                    <Button size="sm" variant="outline" onClick={() => updStage(st._key, { courses: [...st.courses, { _key: newKey(), course_id: courses[0]?.id ?? "", course_order: st.courses.length }] })} disabled={courses.length === 0}>
                      <Plus className="h-4 w-4" /> Thêm khoá
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {st.courses.map((c, ci) => (
                      <div key={c._key} className="flex items-center gap-2">
                        <span className="text-xs w-6 text-muted-foreground">#{ci + 1}</span>
                        <Select value={c.course_id} onValueChange={(v) => updStage(st._key, { courses: st.courses.map(x => x._key === c._key ? { ...x, course_id: v } : x) })}>
                          <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                          <SelectContent>{courses.map(co => <SelectItem key={co.id} value={co.id}>{co.title}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button size="icon" variant="ghost" onClick={() => updStage(st._key, { courses: st.courses.filter(x => x._key !== c._key) })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Bài kiểm tra ({st.assignments.length})</Label>
                    <Button size="sm" variant="outline" onClick={() => updStage(st._key, { assignments: [...st.assignments, { _key: newKey(), assignment_id: assignments[0]?.id ?? "", unlock_condition: "after_all_courses", required: true }] })} disabled={assignments.length === 0}>
                      <Plus className="h-4 w-4" /> Thêm bài KT
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {st.assignments.map(a => (
                      <div key={a._key} className="grid grid-cols-12 gap-2 items-center">
                        <Select value={a.assignment_id} onValueChange={(v) => updStage(st._key, { assignments: st.assignments.map(x => x._key === a._key ? { ...x, assignment_id: v } : x) })}>
                          <SelectTrigger className="col-span-6"><SelectValue /></SelectTrigger>
                          <SelectContent>{assignments.map(as => <SelectItem key={as.id} value={as.id}>{as.title}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={a.unlock_condition} onValueChange={(v) => updStage(st._key, { assignments: st.assignments.map(x => x._key === a._key ? { ...x, unlock_condition: v } : x) })}>
                          <SelectTrigger className="col-span-4"><SelectValue /></SelectTrigger>
                          <SelectContent>{LP_UNLOCK_CONDITION.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                        </Select>
                        <div className="col-span-1 flex items-center gap-1"><Switch checked={a.required} onCheckedChange={(v) => updStage(st._key, { assignments: st.assignments.map(x => x._key === a._key ? { ...x, required: v } : x) })} /></div>
                        <Button size="icon" variant="ghost" className="col-span-1" onClick={() => updStage(st._key, { assignments: st.assignments.filter(x => x._key !== a._key) })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addStage}><Plus className="h-4 w-4" /> Thêm giai đoạn</Button>
        </TabsContent>

        <TabsContent value="audience" className="space-y-3">
          <Card>
            <CardHeader><CardTitle>Đối tượng áp dụng</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {audience.map(a => {
                const opts = a.target_type === "branch" ? branches.map(b => ({ value: b.id, label: b.name }))
                  : a.target_type === "department" ? departments.map(d => ({ value: d.id, label: d.name }))
                  : a.target_type === "user" ? employees.map(e => ({ value: e.id, label: e.name }))
                  : [];
                return (
                  <div key={a._key} className="flex items-center gap-2">
                    <Select value={a.target_type} onValueChange={(v) => setAudience(au => au.map(x => x._key === a._key ? { ...x, target_type: v as AudienceDraft["target_type"], target_id: null } : x))}>
                      <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{LP_AUDIENCE_TYPE.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                    {a.target_type !== "all" && (
                      <Select value={a.target_id ?? ""} onValueChange={(v) => setAudience(au => au.map(x => x._key === a._key ? { ...x, target_id: v } : x))}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder="Chọn..." /></SelectTrigger>
                        <SelectContent>{opts.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                      </Select>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => setAudience(au => au.filter(x => x._key !== a._key))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                );
              })}
              <Button variant="outline" size="sm" onClick={() => setAudience(au => [...au, { _key: newKey(), target_type: "all", target_id: null }])}><Plus className="h-4 w-4" /> Thêm đối tượng</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle>Quy tắc lộ trình</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Học tuần tự</Label>
                  <p className="text-xs text-muted-foreground">Học viên phải hoàn thành giai đoạn trước mới mở giai đoạn sau.</p>
                </div>
                <Switch checked={settings.sequential_mode} onCheckedChange={(v) => setSettings({ ...settings, sequential_mode: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Cho phép học lại</Label>
                  <p className="text-xs text-muted-foreground">Học viên có thể học lại các khoá đã hoàn thành.</p>
                </div>
                <Switch checked={settings.allow_retake} onCheckedChange={(v) => setSettings({ ...settings, allow_retake: v })} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Ngưỡng hoàn thành (%)</Label>
                  <Input type="number" min={80} max={100} value={settings.completion_threshold} onChange={(e) => setSettings({ ...settings, completion_threshold: Number(e.target.value) })} />
                  <p className="mt-1 text-xs text-muted-foreground">Tối thiểu 80%, tối đa 100%.</p>
                </div>
                <div>
                  <Label>Hạn hoàn thành (số ngày)</Label>
                  <Input type="number" value={settings.deadline_days ?? ""} onChange={(e) => setSettings({ ...settings, deadline_days: e.target.value ? Number(e.target.value) : null })} placeholder="Không giới hạn" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
