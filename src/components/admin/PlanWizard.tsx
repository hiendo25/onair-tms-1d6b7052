import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { useAuth } from "@/lib/auth-context";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2, AlertTriangle, Send, Save, Lock, CircleDot, Play, Search } from "lucide-react";
import { PLAN_TYPE, PLAN_TARGET_TYPE } from "@/lib/admin-options";
import { toast } from "sonner";
import type { DBProgram, DBTopic, DBPlanSurvey } from "@/lib/plan-helpers";

const STEPS = [
  { n: 1, label: "Thông tin kế hoạch", sub: "Mục tiêu, thời gian và ngân sách", required: true },
  { n: 2, label: "Chương trình đào tạo", sub: "Chương trình đào tạo của bạn", required: true },
  { n: 3, label: "Chủ đề", sub: "Chương trình đào tạo của bạn", required: true },
  { n: 4, label: "Gán môn học (tùy chọn)", sub: "Gán môn học cho chương trình và chủ đề khi cần", required: false },
  { n: 5, label: "Gửi duyệt đề xuất", sub: "Kiểm tra và gửi kế hoạch để phê duyệt", required: true },
];

export function PlanWizard({ planId: initialPlanId }: { planId?: string }) {
  const { orgId } = useOrg();
  const { user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [planId, setPlanId] = useState<string | undefined>(initialPlanId);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(!!initialPlanId);

  const [info, setInfo] = useState({
    code: "", title: "", objective: "", description: "",
    type: "training", start_date: "", end_date: "", budget: 0,
  });
  const [hasSurvey, setHasSurvey] = useState(false);
  const [survey, setSurvey] = useState({
    survey_id: "", start_date: "", end_date: "", target_type: "all" as "all" | "dept" | "branch",
    target_unit_ids: [] as string[],
  });
  const [surveyDialogOpen, setSurveyDialogOpen] = useState(false);

  const [programs, setPrograms] = useState<DBProgram[]>([]);
  const [topics, setTopics] = useState<DBTopic[]>([]);
  const [topicCourses, setTopicCourses] = useState<{ topic_id: string; course_id: string; course?: any }[]>([]);
  const [programCourses, setProgramCourses] = useState<{ program_id: string; course_id: string; course?: any }[]>([]);
  const [planSurvey, setPlanSurvey] = useState<DBPlanSurvey | null>(null);

  const { data: surveys = [] } = useQuery({
    queryKey: ["surveys-lookup", orgId],
    queryFn: async () => (await supabase.from("surveys").select("id,title,code,status").eq("org_id", orgId)).data ?? [],
  });
  const { data: courses = [] } = useQuery({
    queryKey: ["courses-lookup", orgId],
    queryFn: async () => (await supabase.from("online_courses").select("id,title,code,instructor").eq("org_id", orgId)).data ?? [],
  });
  const { data: branches = [] } = useQuery({
    queryKey: ["branches-lookup", orgId],
    queryFn: async () => (await supabase.from("branches").select("id,name").eq("org_id", orgId)).data ?? [],
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments-lookup", orgId],
    queryFn: async () => (await supabase.from("departments").select("id,name").eq("org_id", orgId)).data ?? [],
  });

  useEffect(() => {
    if (!initialPlanId) return;
    (async () => {
      try {
        const { data: plan } = await supabase.from("plans").select("*").eq("id", initialPlanId).single();
        if (plan) {
          setInfo({
            code: plan.code, title: plan.title, objective: plan.objective ?? "",
            description: plan.description ?? "", type: plan.type,
            start_date: plan.start_date ?? "", end_date: plan.end_date ?? "",
            budget: Number(plan.budget) || 0,
          });
        }
        const { data: ps } = await supabase.from("training_plan_programs").select("*").eq("plan_id", initialPlanId).order("order_index");
        setPrograms((ps ?? []) as DBProgram[]);
        const { data: ts } = await supabase.from("training_plan_topics").select("*").eq("plan_id", initialPlanId).order("order_index");
        setTopics((ts ?? []) as DBTopic[]);
        if (ps?.length) {
          const { data: pc } = await supabase.from("training_plan_program_courses").select("program_id,course_id,course:online_courses(*)").in("program_id", ps.map((x: any) => x.id));
          setProgramCourses((pc ?? []) as any);
        }
        if (ts?.length) {
          const { data: tc } = await supabase.from("training_plan_topic_courses").select("topic_id,course_id,course:online_courses(*)").in("topic_id", ts.map((x: any) => x.id));
          setTopicCourses((tc ?? []) as any);
        }
        const { data: tps } = await supabase.from("training_plan_surveys").select("*").eq("plan_id", initialPlanId).maybeSingle();
        if (tps) {
          setHasSurvey(true);
          setSurvey({
            survey_id: tps.survey_id,
            start_date: tps.start_date ?? "",
            end_date: tps.end_date ?? "",
            target_type: (tps.target_type as "all" | "dept" | "branch") ?? "all",
            target_unit_ids: (tps.target_unit_ids as string[]) ?? [],
          });
          setPlanSurvey(tps as unknown as DBPlanSurvey);
        }
      } finally {
        setLoadingPlan(false);
      }
    })();
  }, [initialPlanId]);

  const surveyLocked = hasSurvey && planSurvey?.status !== "completed";

  // ======================== Persist ========================
  async function persistDraft(targetStep: number) {
    setSaving(true);
    try {
      let pid = planId;
      const payload: any = {
        ...info, org_id: orgId, status: "draft",
        budget: Number(info.budget) || 0,
        start_date: info.start_date || null, end_date: info.end_date || null,
        created_by: user?.id ?? null,
      };
      // Auto-generate code if blank
      if (!payload.code) payload.code = `KH${Date.now().toString().slice(-6)}`;
      if (!pid) {
        const { data, error } = await supabase.from("plans").insert(payload).select("id").single();
        if (error) throw error;
        pid = data.id;
        setPlanId(pid);
      } else {
        delete payload.created_by;
        const { error } = await supabase.from("plans").update(payload).eq("id", pid);
        if (error) throw error;
      }

      if (hasSurvey && survey.survey_id) {
        const surveyRow = {
          plan_id: pid, org_id: orgId, survey_id: survey.survey_id,
          start_date: survey.start_date || null, end_date: survey.end_date || null,
          target_type: survey.target_type, target_unit_ids: survey.target_unit_ids,
          status: planSurvey?.status ?? "pending",
        };
        if (planSurvey) {
          await supabase.from("training_plan_surveys").update(surveyRow).eq("id", planSurvey.id);
        } else {
          const { data } = await supabase.from("training_plan_surveys").insert(surveyRow).select("*").single();
          if (data) setPlanSurvey(data as DBPlanSurvey);
        }
        if (planSurvey?.status !== "completed") {
          await supabase.from("plans").update({ status: "pending_survey" }).eq("id", pid);
        }
      } else if (!hasSurvey && planSurvey) {
        await supabase.from("training_plan_surveys").delete().eq("id", planSurvey.id);
        setPlanSurvey(null);
      }

      setStep(targetStep);
      qc.invalidateQueries({ queryKey: ["plans", orgId] });
      toast.success("Đã lưu");
    } catch (e: any) {
      toast.error(e.message ?? "Lỗi lưu kế hoạch");
    } finally {
      setSaving(false);
    }
  }

  // ======================== Programs ========================
  async function addProgram() {
    if (!planId) { toast.error("Vui lòng lưu bước 1 trước."); return; }
    const { data, error } = await supabase.from("training_plan_programs").insert({
      plan_id: planId, org_id: orgId, name: "Chương trình mới",
      description: "", order_index: programs.length,
    }).select("*").single();
    if (error) { toast.error(error.message); return; }
    setPrograms([...programs, data as DBProgram]);
  }
  async function updateProgram(id: string, patch: Partial<DBProgram>) {
    setPrograms(programs.map((p) => p.id === id ? { ...p, ...patch } : p));
    await supabase.from("training_plan_programs").update(patch).eq("id", id);
  }
  async function removeProgram(id: string) {
    await supabase.from("training_plan_programs").delete().eq("id", id);
    setPrograms(programs.filter((p) => p.id !== id));
    setTopics(topics.filter((t) => t.program_id !== id));
  }

  // ======================== Topics ========================
  async function addTopic(programId: string | null) {
    if (!planId) return;
    const { data, error } = await supabase.from("training_plan_topics").insert({
      plan_id: planId, program_id: programId, org_id: orgId,
      name: "Chủ đề mới", description: "", order_index: topics.length,
    }).select("*").single();
    if (error) { toast.error(error.message); return; }
    setTopics([...topics, data as DBTopic]);
  }
  async function updateTopic(id: string, patch: Partial<DBTopic>) {
    setTopics(topics.map((t) => t.id === id ? { ...t, ...patch } : t));
    await supabase.from("training_plan_topics").update(patch).eq("id", id);
  }
  async function removeTopic(id: string) {
    await supabase.from("training_plan_topics").delete().eq("id", id);
    setTopics(topics.filter((t) => t.id !== id));
  }

  // ======================== Courses ========================
  async function assignCourseToTopic(topicId: string, courseId: string) {
    if (topicCourses.some((tc) => tc.topic_id === topicId && tc.course_id === courseId)) { toast.warning("Đã gán."); return; }
    const { data, error } = await supabase.from("training_plan_topic_courses").insert({ topic_id: topicId, course_id: courseId, org_id: orgId })
      .select("*, course:online_courses(*)").single();
    if (error) { toast.error(error.message); return; }
    setTopicCourses([...topicCourses, data as any]);
  }
  async function unassignTopicCourse(topicId: string, courseId: string) {
    await supabase.from("training_plan_topic_courses").delete().match({ topic_id: topicId, course_id: courseId });
    setTopicCourses(topicCourses.filter((tc) => !(tc.topic_id === topicId && tc.course_id === courseId)));
  }
  async function assignCourseToProgram(programId: string, courseId: string) {
    if (programCourses.some((pc) => pc.program_id === programId && pc.course_id === courseId)) { toast.warning("Đã gán."); return; }
    const { data, error } = await supabase.from("training_plan_program_courses").insert({ program_id: programId, course_id: courseId, org_id: orgId })
      .select("*, course:online_courses(*)").single();
    if (error) { toast.error(error.message); return; }
    setProgramCourses([...programCourses, data as any]);
  }
  async function unassignProgramCourse(programId: string, courseId: string) {
    await supabase.from("training_plan_program_courses").delete().match({ program_id: programId, course_id: courseId });
    setProgramCourses(programCourses.filter((pc) => !(pc.program_id === programId && pc.course_id === courseId)));
  }
  async function createCourse(name: string): Promise<string | null> {
    const { data, error } = await supabase.from("online_courses").insert({
      org_id: orgId, code: `C${Date.now().toString().slice(-6)}`, title: name,
      tags: ["Cần hoàn thiện tài liệu"],
    }).select("id").single();
    if (error) { toast.error(error.message); return null; }
    qc.invalidateQueries({ queryKey: ["courses-lookup", orgId] });
    return data.id;
  }

  async function submitForApproval() {
    if (!planId) return;
    const { error } = await supabase.from("plans").update({ status: "pending" }).eq("id", planId);
    if (error) { toast.error(error.message); return; }
    toast.success("Đã gửi duyệt");
    qc.invalidateQueries({ queryKey: ["plans", orgId] });
    nav({ to: "/admin/plans/$id", params: { id: planId } });
  }

  // ======================== Renderers ========================
  const progress = Math.round(((step - 1) / (STEPS.length - 1)) * 100);

  if (loadingPlan) {
    return (
      <PageContainer
        title="Đang tải kế hoạch..."
        breadcrumbs={[{ title: "Kế hoạch đào tạo", path: "/admin/plans" }, { title: "Chỉnh sửa" }]}
      >
        <div className="grid gap-6 md:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            <Card><CardContent className="p-4 space-y-3"><Skeleton className="h-4 w-32" /><Skeleton className="h-1.5 w-full" /></CardContent></Card>
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></CardContent></Card>
            ))}
          </div>
          <div className="space-y-4">
            <Card><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-2 gap-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
            </CardContent></Card>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Tạo kế hoạch đào tạo"
      breadcrumbs={[{ title: "Kế hoạch đào tạo", path: "/admin/plans" }, { title: initialPlanId ? "Chỉnh sửa" : "Tạo kế hoạch đào tạo" }]}
    >
      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        {/* Sidebar stepper */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Hành trình kế hoạch</span>
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
            const locked = surveyLocked && (s.n === 2 || s.n === 3);
            return (
              <button
                key={s.n}
                disabled={locked}
                onClick={() => setStep(s.n)}
                className={`w-full text-left rounded-lg border p-3 transition ${
                  active ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                  : done ? "border-emerald-200 bg-white"
                  : locked ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                  : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    active ? "bg-blue-600 text-white"
                    : done ? "bg-emerald-500 text-white"
                    : locked ? "bg-slate-200 text-slate-400"
                    : "bg-slate-100 text-slate-500"
                  }`}>
                    {locked ? <Lock className="h-3.5 w-3.5" /> : done ? <Check className="h-3.5 w-3.5" /> : active ? <CircleDot className="h-3.5 w-3.5" /> : <span className="text-xs font-semibold">{s.n}</span>}
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
                  <p className="text-sm text-slate-500 mt-1">{stepDescription(step)}</p>
                </div>
                {STEPS[step - 1].required && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Bắt buộc</Badge>}
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <Label>Tên kế hoạch *</Label>
                    <Input className="mt-1" placeholder="VD: Kế hoạch đào tạo 2025" value={info.title} onChange={(e) => setInfo({ ...info, title: e.target.value })} />
                  </div>
                  <div>
                    <Label>Mục tiêu</Label>
                    <Textarea className="mt-1" rows={4} placeholder="Mô tả mục tiêu ngắn của kế hoạch đào tạo" value={info.objective} onChange={(e) => setInfo({ ...info, objective: e.target.value })} />
                  </div>
                  <div>
                    <Label>Loại</Label>
                    <Select value={info.type} onValueChange={(v) => setInfo({ ...info, type: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{PLAN_TYPE.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-lg border p-4 bg-slate-50/50">
                    <Label className="text-sm font-semibold">Thời gian triển khai</Label>
                    <p className="text-xs text-slate-500 mt-1 mb-3">Xác định thời gian bắt đầu và kết thúc để chúng tôi giúp bạn theo dõi tiến độ.</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input type="date" value={info.start_date} onChange={(e) => setInfo({ ...info, start_date: e.target.value })} />
                      <Input type="date" value={info.end_date} onChange={(e) => setInfo({ ...info, end_date: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Ngân sách</Label>
                      <Input className="mt-1" type="number" value={info.budget} onChange={(e) => setInfo({ ...info, budget: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Khảo sát</Label>
                      <Button variant="outline" type="button" className="mt-1 w-full justify-start" onClick={() => setSurveyDialogOpen(true)}>
                        <Search className="h-4 w-4 mr-2" />
                        {hasSurvey && survey.survey_id ? (surveys.find((s: any) => s.id === survey.survey_id)?.title ?? "Đã chọn") : "Chọn khảo sát"}
                      </Button>
                    </div>
                  </div>
                  {hasSurvey && planSurvey && (
                    <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      Trạng thái khảo sát: <Badge variant="outline" className="ml-1">{planSurvey.status}</Badge>
                      {planSurvey.status !== "completed" && <span className="ml-1">— Bước 2-3 sẽ bị khoá đến khi khảo sát hoàn tất.</span>}
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (surveyLocked ? <LockedNotice /> : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600">Tạo các chương trình con thuộc kế hoạch này.</p>
                    <Button size="sm" onClick={addProgram}><Plus className="h-4 w-4 mr-1" />Thêm chương trình</Button>
                  </div>
                  {programs.length === 0 && <EmptyBox label="Chưa có chương trình. Cần ít nhất 1 chương trình." />}
                  {programs.map((p) => (
                    <div key={p.id} className="border rounded-lg p-4 space-y-3 bg-white">
                      <div className="grid gap-2 md:grid-cols-2">
                        <Input placeholder="Tên chương trình *" value={p.name} onChange={(e) => updateProgram(p.id, { name: e.target.value })} />
                        <div className="flex gap-2">
                          <Input type="date" value={p.start_date ?? ""} onChange={(e) => updateProgram(p.id, { start_date: e.target.value })} />
                          <Input type="date" value={p.end_date ?? ""} onChange={(e) => updateProgram(p.id, { end_date: e.target.value })} />
                          <Button variant="ghost" size="icon" onClick={() => removeProgram(p.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </div>
                      <Textarea placeholder="Mô tả" rows={2} value={p.description} onChange={(e) => updateProgram(p.id, { description: e.target.value })} />
                    </div>
                  ))}
                </div>
              ))}

              {step === 3 && (surveyLocked ? <LockedNotice /> : (
                <div className="space-y-4">
                  {programs.map((p) => <TopicGroup key={p.id} programId={p.id} label={p.name} topics={topics} onAdd={() => addTopic(p.id)} onUpdate={updateTopic} onRemove={removeTopic} />)}
                  <TopicGroup programId={null} label="Chủ đề độc lập (không thuộc chương trình)" topics={topics} onAdd={() => addTopic(null)} onUpdate={updateTopic} onRemove={removeTopic} />
                </div>
              ))}

              {step === 4 && (
                <div className="space-y-4">
                  {programs.length === 0 && <EmptyBox label="Tạo chương trình ở Bước 2 trước." />}
                  {programs.map((p) => {
                    const topicsOfProgram = topics.filter((t) => t.program_id === p.id);
                    return (
                      <div key={p.id} className="border rounded-lg p-4 space-y-3">
                        <div className="font-medium">{p.name}</div>
                        {topicsOfProgram.length === 0 ? (
                          <CourseAssigner courses={courses} kind="program" parentId={p.id}
                            currentCourseIds={programCourses.filter((pc) => pc.program_id === p.id).map((pc) => pc.course_id)}
                            onAssign={(cid) => assignCourseToProgram(p.id, cid)}
                            onUnassign={(cid) => unassignProgramCourse(p.id, cid)}
                            onCreate={createCourse} />
                        ) : topicsOfProgram.map((t) => (
                          <div key={t.id} className="pl-3 border-l-2 border-slate-200 space-y-1">
                            <div className="text-sm font-medium">{t.name}</div>
                            <CourseAssigner courses={courses} kind="topic" parentId={t.id}
                              currentCourseIds={topicCourses.filter((tc) => tc.topic_id === t.id).map((tc) => tc.course_id)}
                              onAssign={(cid) => assignCourseToTopic(t.id, cid)}
                              onUnassign={(cid) => unassignTopicCourse(t.id, cid)}
                              onCreate={createCourse} />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  {topics.filter((t) => !t.program_id).map((t) => (
                    <div key={t.id} className="border rounded-lg p-4 space-y-1">
                      <div className="font-medium">Chủ đề độc lập: {t.name}</div>
                      <CourseAssigner courses={courses} kind="topic" parentId={t.id}
                        currentCourseIds={topicCourses.filter((tc) => tc.topic_id === t.id).map((tc) => tc.course_id)}
                        onAssign={(cid) => assignCourseToTopic(t.id, cid)}
                        onUnassign={(cid) => unassignTopicCourse(t.id, cid)}
                        onCreate={createCourse} />
                    </div>
                  ))}
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-4">
                    <SummaryCard label="Ngân sách" value={`${(info.budget || 0).toLocaleString("vi-VN")} ₫`} />
                    <SummaryCard label="Thời gian" value={`${info.start_date || "—"} → ${info.end_date || "—"}`} />
                    <SummaryCard label="Chương trình / Chủ đề" value={`${programs.length} / ${topics.length}`} />
                    <SummaryCard label="Tổng môn học" value={String(topicCourses.length + programCourses.length)} />
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="font-semibold text-lg">{info.title || "(Chưa có tên)"}</div>
                    <p className="text-sm text-slate-600 mt-1">{info.objective || "—"}</p>
                    <Separator className="my-3" />
                    {programs.map((p) => (
                      <div key={p.id} className="border rounded p-3 mb-2">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.start_date} → {p.end_date}</div>
                        <ul className="mt-2 space-y-1 pl-4 list-disc text-sm">
                          {topics.filter((t) => t.program_id === p.id).map((t) => (
                            <li key={t.id}>{t.name}
                              <ul className="pl-4 text-slate-600">
                                {topicCourses.filter((tc) => tc.topic_id === t.id).map((tc) => <li key={tc.course_id}>• {tc.course?.title ?? tc.course_id}</li>)}
                              </ul>
                            </li>
                          ))}
                          {programCourses.filter((pc) => pc.program_id === p.id).map((pc) => <li key={pc.course_id}>• {pc.course?.title ?? pc.course_id}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer nav */}
          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
              <ChevronLeft className="h-4 w-4 mr-1" />Quay lại
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => persistDraft(step)} disabled={saving}><Save className="h-4 w-4 mr-1" />Lưu</Button>
              {step === 1 && (
                <Button variant="outline" onClick={() => persistDraft(2)} disabled={saving}>
                  <Play className="h-4 w-4 mr-1" />Thực hiện kế hoạch
                </Button>
              )}
              {step < 5 ? (
                <Button onClick={() => persistDraft(step + 1)} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  Tiếp tục<ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={submitForApproval} className="bg-emerald-600 hover:bg-emerald-700">
                  <Send className="h-4 w-4 mr-1" />Gửi duyệt
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Survey dialog */}
      <Dialog open={surveyDialogOpen} onOpenChange={setSurveyDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Chọn khảo sát nhu cầu đào tạo</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Khảo sát *</Label>
              <Select value={survey.survey_id} onValueChange={(v) => { setSurvey({ ...survey, survey_id: v }); setHasSurvey(true); }}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="-- Chọn khảo sát --" /></SelectTrigger>
                <SelectContent>{surveys.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div><Label>Bắt đầu</Label><Input type="date" className="mt-1" value={survey.start_date} onChange={(e) => setSurvey({ ...survey, start_date: e.target.value })} /></div>
              <div><Label>Kết thúc</Label><Input type="date" className="mt-1" value={survey.end_date} onChange={(e) => setSurvey({ ...survey, end_date: e.target.value })} /></div>
            </div>
            <div>
              <Label>Đối tượng</Label>
              <Select value={survey.target_type} onValueChange={(v: any) => setSurvey({ ...survey, target_type: v, target_unit_ids: [] })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{PLAN_TARGET_TYPE.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {(survey.target_type === "dept" || survey.target_type === "branch") && (
              <div>
                <Label>{survey.target_type === "dept" ? "Phòng ban" : "Chi nhánh"}</Label>
                <div className="border rounded-md p-2 max-h-40 overflow-auto space-y-1 mt-1">
                  {(survey.target_type === "dept" ? departments : branches).map((u: any) => (
                    <label key={u.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={survey.target_unit_ids.includes(u.id)} onChange={(e) => {
                        setSurvey({ ...survey, target_unit_ids: e.target.checked ? [...survey.target_unit_ids, u.id] : survey.target_unit_ids.filter((x) => x !== u.id) });
                      }} />
                      {u.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setHasSurvey(false); setSurvey({ survey_id: "", start_date: "", end_date: "", target_type: "all", target_unit_ids: [] }); setSurveyDialogOpen(false); }}>Bỏ chọn</Button>
            <Button onClick={() => setSurveyDialogOpen(false)}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function stepDescription(n: number) {
  const map: Record<number, string> = {
    1: "Xác định mục tiêu, phạm vi thời gian và khảo sát liên quan trước khi bắt đầu.",
    2: "Tạo các chương trình đào tạo thuộc kế hoạch.",
    3: "Tạo chủ đề chi tiết cho mỗi chương trình hoặc chủ đề độc lập.",
    4: "Gán môn học vào chủ đề / chương trình. Có thể tạo nhanh môn học mới.",
    5: "Xem lại toàn bộ kế hoạch và gửi cho người duyệt.",
  };
  return map[n] ?? "";
}

function LockedNotice() {
  return (
    <div className="rounded-lg border bg-amber-50 border-amber-200 p-6 text-center text-amber-800">
      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
      Khảo sát chưa hoàn tất. Phải hoàn tất khảo sát trước khi mở khoá bước này.
    </div>
  );
}

function EmptyBox({ label }: { label: string }) {
  return <div className="border-2 border-dashed rounded-lg p-8 text-center text-sm text-slate-500">{label}</div>;
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-lg p-3 bg-slate-50">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-semibold mt-1">{value}</div>
    </div>
  );
}

function TopicGroup({ programId, label, topics, onAdd, onUpdate, onRemove }: {
  programId: string | null; label: string; topics: DBTopic[];
  onAdd: () => void; onUpdate: (id: string, patch: Partial<DBTopic>) => void; onRemove: (id: string) => void;
}) {
  const list = topics.filter((t) => t.program_id === programId);
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-sm">{label}</h4>
        <Button size="sm" variant="outline" onClick={onAdd}><Plus className="h-3 w-3 mr-1" />Chủ đề</Button>
      </div>
      {list.length === 0 ? <p className="text-xs text-slate-400">Chưa có chủ đề</p> : list.map((t) => (
        <div key={t.id} className="space-y-1 pl-2 border-l-2 border-slate-200">
          <div className="flex gap-2">
            <Input placeholder="Tên chủ đề" value={t.name} onChange={(e) => onUpdate(t.id, { name: e.target.value })} />
            <Button variant="ghost" size="icon" onClick={() => onRemove(t.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
          </div>
          <Textarea placeholder="Mô tả" rows={1} value={t.description} onChange={(e) => onUpdate(t.id, { description: e.target.value })} />
        </div>
      ))}
    </div>
  );
}

function CourseAssigner({ courses, kind, parentId, currentCourseIds, onAssign, onUnassign, onCreate }: {
  courses: any[]; kind: "topic" | "program"; parentId: string;
  currentCourseIds: string[];
  onAssign: (courseId: string) => void; onUnassign: (courseId: string) => void; onCreate: (name: string) => Promise<string | null>;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newName, setNewName] = useState("");
  void kind; void parentId;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {currentCourseIds.map((cid) => {
          const c = courses.find((x: any) => x.id === cid);
          return (
            <Badge key={cid} variant="secondary" className="gap-1">
              {c?.title ?? cid}
              <button onClick={() => onUnassign(cid)} className="ml-1">×</button>
            </Badge>
          );
        })}
        <Button size="sm" variant="outline" onClick={() => setPickerOpen(!pickerOpen)}><Plus className="h-3 w-3 mr-1" />Gán môn học</Button>
      </div>
      {pickerOpen && (
        <div className="border rounded-md p-2 space-y-2 bg-slate-50">
          <div className="max-h-40 overflow-auto space-y-1">
            {courses.map((c: any) => {
              const taken = currentCourseIds.includes(c.id);
              return (
                <button key={c.id} disabled={taken} onClick={() => onAssign(c.id)}
                  className={`block w-full text-left text-sm px-2 py-1 rounded ${taken ? "bg-amber-100 text-amber-700" : "hover:bg-white"}`}>
                  {c.code} — {c.title} {taken && "(đã gán)"}
                </button>
              );
            })}
          </div>
          <Separator />
          <div className="flex gap-2">
            <Input placeholder="Tạo môn học mới..." value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Button size="sm" onClick={async () => {
              if (!newName.trim()) return;
              const cid = await onCreate(newName.trim());
              if (cid) { onAssign(cid); setNewName(""); }
            }}>Tạo</Button>
          </div>
        </div>
      )}
    </div>
  );
}
