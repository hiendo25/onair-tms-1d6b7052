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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2, AlertTriangle, Send, Save } from "lucide-react";
import { PLAN_TYPE, PLAN_TARGET_TYPE } from "@/lib/admin-options";
import { toast } from "sonner";
import type { DBProgram, DBTopic, DBPlanSurvey } from "@/lib/plan-helpers";

const STEPS = [
  { n: 1, label: "Thông tin & khảo sát" },
  { n: 2, label: "Chương trình" },
  { n: 3, label: "Chủ đề" },
  { n: 4, label: "Môn học" },
  { n: 5, label: "Duyệt & gửi" },
];

export function PlanWizard({ planId: initialPlanId }: { planId?: string }) {
  const { orgId } = useOrg();
  const { user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [planId, setPlanId] = useState<string | undefined>(initialPlanId);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 form
  const [info, setInfo] = useState({
    code: "", title: "", objective: "", description: "",
    type: "training", start_date: "", end_date: "", budget: 0,
  });
  const [hasSurvey, setHasSurvey] = useState(false);
  const [survey, setSurvey] = useState({
    survey_id: "", start_date: "", end_date: "", target_type: "all" as "all" | "dept" | "branch",
    target_unit_ids: [] as string[],
  });

  const [programs, setPrograms] = useState<DBProgram[]>([]);
  const [topics, setTopics] = useState<DBTopic[]>([]);
  const [topicCourses, setTopicCourses] = useState<{ topic_id: string; course_id: string; course?: any }[]>([]);
  const [programCourses, setProgramCourses] = useState<{ program_id: string; course_id: string; course?: any }[]>([]);
  const [planSurvey, setPlanSurvey] = useState<DBPlanSurvey | null>(null);

  // Lookup lists
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

  // Load existing plan if editing
  useEffect(() => {
    if (!initialPlanId) return;
    (async () => {
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
          target_type: tps.target_type,
          target_unit_ids: (tps.target_unit_ids as string[]) ?? [],
        });
        setPlanSurvey(tps as DBPlanSurvey);
      }
    })();
  }, [initialPlanId]);

  const surveyLocked = hasSurvey && planSurvey?.status !== "completed";

  // ======================== Save helpers ========================
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

      // Save survey link
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
        // If survey not yet completed, lock plan
        if (planSurvey?.status !== "completed") {
          await supabase.from("plans").update({ status: "pending_survey" }).eq("id", pid);
        }
      } else if (!hasSurvey && planSurvey) {
        await supabase.from("training_plan_surveys").delete().eq("id", planSurvey.id);
        setPlanSurvey(null);
      }

      setStep(targetStep);
      qc.invalidateQueries({ queryKey: ["plans", orgId] });
    } catch (e: any) {
      toast.error(e.message ?? "Lỗi lưu kế hoạch");
    } finally {
      setSaving(false);
    }
  }

  // ======================== Step 1 ========================
  function Step1() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Thông tin kế hoạch</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div><Label>Mã kế hoạch *</Label><Input value={info.code} onChange={(e) => setInfo({ ...info, code: e.target.value })} /></div>
            <div><Label>Tên kế hoạch *</Label><Input value={info.title} onChange={(e) => setInfo({ ...info, title: e.target.value })} /></div>
            <div><Label>Loại *</Label>
              <Select value={info.type} onValueChange={(v) => setInfo({ ...info, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PLAN_TYPE.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Ngân sách (VNĐ)</Label><Input type="number" value={info.budget} onChange={(e) => setInfo({ ...info, budget: Number(e.target.value) })} /></div>
            <div><Label>Ngày bắt đầu *</Label><Input type="date" value={info.start_date} onChange={(e) => setInfo({ ...info, start_date: e.target.value })} /></div>
            <div><Label>Ngày kết thúc *</Label><Input type="date" value={info.end_date} onChange={(e) => setInfo({ ...info, end_date: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Mục tiêu</Label><Textarea rows={3} value={info.objective} onChange={(e) => setInfo({ ...info, objective: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Mô tả</Label><Textarea rows={2} value={info.description} onChange={(e) => setInfo({ ...info, description: e.target.value })} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center justify-between">Khảo sát nhu cầu đào tạo
            <div className="flex items-center gap-2 text-sm font-normal"><Switch checked={hasSurvey} onCheckedChange={setHasSurvey} /> Gắn khảo sát</div>
          </CardTitle></CardHeader>
          {hasSurvey && (
            <CardContent className="space-y-4">
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex gap-2"><AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />Bước 2-3 sẽ bị khoá cho đến khi khảo sát hoàn thành.</div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2"><Label>Chọn khảo sát *</Label>
                  <Select value={survey.survey_id} onValueChange={(v) => setSurvey({ ...survey, survey_id: v })}>
                    <SelectTrigger><SelectValue placeholder="-- Chọn khảo sát --" /></SelectTrigger>
                    <SelectContent>{surveys.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Bắt đầu *</Label><Input type="date" value={survey.start_date} onChange={(e) => setSurvey({ ...survey, start_date: e.target.value })} /></div>
                <div><Label>Kết thúc *</Label><Input type="date" value={survey.end_date} onChange={(e) => setSurvey({ ...survey, end_date: e.target.value })} /></div>
                <div><Label>Đối tượng *</Label>
                  <Select value={survey.target_type} onValueChange={(v: any) => setSurvey({ ...survey, target_type: v, target_unit_ids: [] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PLAN_TARGET_TYPE.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {(survey.target_type === "dept" || survey.target_type === "branch") && (
                  <div><Label>{survey.target_type === "dept" ? "Phòng ban" : "Chi nhánh"} *</Label>
                    <div className="border rounded-md p-2 max-h-40 overflow-auto space-y-1">
                      {(survey.target_type === "dept" ? departments : branches).map((u: any) => (
                        <label key={u.id} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={survey.target_unit_ids.includes(u.id)} onChange={(e) => {
                            setSurvey({ ...survey, target_unit_ids: e.target.checked
                              ? [...survey.target_unit_ids, u.id]
                              : survey.target_unit_ids.filter((x) => x !== u.id) });
                          }} />
                          {u.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {planSurvey && (
                <div className="rounded-md bg-slate-50 border p-3 text-sm">
                  Trạng thái khảo sát: <Badge>{planSurvey.status}</Badge>
                  {planSurvey.status !== "completed" && <span className="text-slate-600 ml-2">— phải hoàn tất khảo sát trước khi tiếp tục.</span>}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  // ======================== Step 2 — Programs ========================
  async function addProgram() {
    if (!planId) { toast.error("Lưu bước 1 trước"); return; }
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

  function Step2() {
    return (
      <Card>
        <CardHeader><CardTitle className="flex justify-between">Chương trình đào tạo
          <Button size="sm" onClick={addProgram}><Plus className="h-4 w-4 mr-1" />Thêm chương trình</Button>
        </CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {programs.length === 0 && <p className="text-sm text-slate-500">Chưa có chương trình. Cần ít nhất 1 chương trình.</p>}
          {programs.map((p) => (
            <div key={p.id} className="border rounded-md p-3 space-y-2">
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
        </CardContent>
      </Card>
    );
  }

  // ======================== Step 3 — Topics ========================
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

  function TopicGroup({ programId, label }: { programId: string | null; label: string }) {
    const list = topics.filter((t) => t.program_id === programId);
    return (
      <div className="border rounded-md p-3 space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-sm">{label}</h4>
          <Button size="sm" variant="outline" onClick={() => addTopic(programId)}><Plus className="h-3 w-3 mr-1" />Chủ đề</Button>
        </div>
        {list.length === 0 ? <p className="text-xs text-slate-400">Chưa có chủ đề</p> :
          list.map((t) => (
            <div key={t.id} className="space-y-1 pl-2 border-l-2 border-slate-200">
              <div className="flex gap-2">
                <Input placeholder="Tên chủ đề" value={t.name} onChange={(e) => updateTopic(t.id, { name: e.target.value })} />
                <Button variant="ghost" size="icon" onClick={() => removeTopic(t.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
              </div>
              <Textarea placeholder="Mô tả" rows={1} value={t.description} onChange={(e) => updateTopic(t.id, { description: e.target.value })} />
            </div>
          ))}
      </div>
    );
  }

  function Step3() {
    return (
      <Card>
        <CardHeader><CardTitle>Chủ đề đào tạo</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {programs.map((p) => <TopicGroup key={p.id} programId={p.id} label={p.name} />)}
          <TopicGroup programId={null} label="Chủ đề độc lập (không thuộc chương trình)" />
        </CardContent>
      </Card>
    );
  }

  // ======================== Step 4 — Courses ========================
  async function assignCourseToTopic(topicId: string, courseId: string) {
    const exists = topicCourses.some((tc) => tc.topic_id === topicId && tc.course_id === courseId);
    if (exists) { toast.warning("Môn học này đã tồn tại trong chủ đề."); return; }
    const { data, error } = await supabase.from("training_plan_topic_courses").insert({
      topic_id: topicId, course_id: courseId, org_id: orgId,
    }).select("*, course:online_courses(*)").single();
    if (error) { toast.error(error.message); return; }
    setTopicCourses([...topicCourses, data as any]);
  }
  async function unassignTopicCourse(topicId: string, courseId: string) {
    await supabase.from("training_plan_topic_courses").delete().match({ topic_id: topicId, course_id: courseId });
    setTopicCourses(topicCourses.filter((tc) => !(tc.topic_id === topicId && tc.course_id === courseId)));
  }
  async function assignCourseToProgram(programId: string, courseId: string) {
    const exists = programCourses.some((pc) => pc.program_id === programId && pc.course_id === courseId);
    if (exists) { toast.warning("Môn học này đã tồn tại trong chương trình."); return; }
    const { data, error } = await supabase.from("training_plan_program_courses").insert({
      program_id: programId, course_id: courseId, org_id: orgId,
    }).select("*, course:online_courses(*)").single();
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

  function CourseAssigner({ kind, parentId, currentCourseIds }: { kind: "topic" | "program"; parentId: string; currentCourseIds: string[] }) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [newName, setNewName] = useState("");
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {currentCourseIds.map((cid) => {
            const c = courses.find((x: any) => x.id === cid);
            return (
              <Badge key={cid} variant="secondary" className="gap-1">
                {c?.title ?? cid}
                <button onClick={() => kind === "topic" ? unassignTopicCourse(parentId, cid) : unassignProgramCourse(parentId, cid)} className="ml-1">×</button>
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
                  <button key={c.id} disabled={taken} onClick={() => kind === "topic" ? assignCourseToTopic(parentId, c.id) : assignCourseToProgram(parentId, c.id)}
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
                const cid = await createCourse(newName.trim());
                if (cid) {
                  if (kind === "topic") await assignCourseToTopic(parentId, cid);
                  else await assignCourseToProgram(parentId, cid);
                  setNewName("");
                }
              }}>Tạo</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function Step4() {
    return (
      <Card>
        <CardHeader><CardTitle>Gán môn học</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {programs.map((p) => {
            const topicsOfProgram = topics.filter((t) => t.program_id === p.id);
            return (
              <div key={p.id} className="border rounded-md p-3 space-y-3">
                <div className="font-medium">{p.name}</div>
                {topicsOfProgram.length === 0 ? (
                  <CourseAssigner kind="program" parentId={p.id}
                    currentCourseIds={programCourses.filter((pc) => pc.program_id === p.id).map((pc) => pc.course_id)} />
                ) : topicsOfProgram.map((t) => (
                  <div key={t.id} className="pl-3 border-l-2 border-slate-200 space-y-1">
                    <div className="text-sm font-medium">{t.name}</div>
                    <CourseAssigner kind="topic" parentId={t.id}
                      currentCourseIds={topicCourses.filter((tc) => tc.topic_id === t.id).map((tc) => tc.course_id)} />
                  </div>
                ))}
              </div>
            );
          })}
          {topics.filter((t) => !t.program_id).map((t) => (
            <div key={t.id} className="border rounded-md p-3 space-y-1">
              <div className="font-medium">Chủ đề độc lập: {t.name}</div>
              <CourseAssigner kind="topic" parentId={t.id}
                currentCourseIds={topicCourses.filter((tc) => tc.topic_id === t.id).map((tc) => tc.course_id)} />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // ======================== Step 5 — Review ========================
  async function submitForApproval() {
    if (!planId) return;
    const { error } = await supabase.from("plans").update({ status: "pending" }).eq("id", planId);
    if (error) { toast.error(error.message); return; }
    toast.success("Đã gửi duyệt");
    qc.invalidateQueries({ queryKey: ["plans", orgId] });
    nav({ to: "/admin/plans/$id", params: { id: planId } });
  }

  function Step5() {
    const totalCourses = topicCourses.length + programCourses.length;
    return (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Ngân sách</div><div className="text-lg font-semibold">{info.budget.toLocaleString("vi-VN")} ₫</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Thời gian</div><div className="text-sm font-medium">{info.start_date} → {info.end_date}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Chương trình / Chủ đề</div><div className="text-lg font-semibold">{programs.length} / {topics.length}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Tổng môn học</div><div className="text-lg font-semibold">{totalCourses}</div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>{info.title}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="text-slate-500">Mục tiêu:</span> {info.objective || "—"}</p>
            {programs.map((p) => (
              <div key={p.id} className="border rounded-md p-3">
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-slate-500">{p.start_date} → {p.end_date}</div>
                <p className="text-sm mt-1">{p.description}</p>
                <ul className="mt-2 space-y-1 pl-4 list-disc">
                  {topics.filter((t) => t.program_id === p.id).map((t) => (
                    <li key={t.id}>{t.name}
                      <ul className="pl-4 list-circle text-slate-600">
                        {topicCourses.filter((tc) => tc.topic_id === t.id).map((tc) => <li key={tc.course_id}>• {tc.course?.title ?? tc.course_id}</li>)}
                      </ul>
                    </li>
                  ))}
                  {programCourses.filter((pc) => pc.program_id === p.id).map((pc) => <li key={pc.course_id}>• {pc.course?.title ?? pc.course_id}</li>)}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => persistDraft(5)}><Save className="h-4 w-4 mr-1" />Lưu bản nháp</Button>
          <Button onClick={submitForApproval}><Send className="h-4 w-4 mr-1" />Gửi duyệt</Button>
        </div>
      </div>
    );
  }

  // ======================== Render ========================
  function StepNav() {
    return (
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}><ChevronLeft className="h-4 w-4 mr-1" />Quay lại</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => persistDraft(step)} disabled={saving}><Save className="h-4 w-4 mr-1" />Lưu</Button>
          {step < 5 && <Button onClick={() => persistDraft(step + 1)} disabled={saving || (step === 1 && surveyLocked && step + 1 < 4)}>
            Tiếp tục<ChevronRight className="h-4 w-4 ml-1" />
          </Button>}
        </div>
      </div>
    );
  }

  return (
    <PageContainer
      title={initialPlanId ? "Chỉnh sửa kế hoạch" : "Tạo kế hoạch đào tạo"}
      breadcrumbs={[{ title: "Kế hoạch", path: "/admin/plans" }, { title: initialPlanId ? "Chỉnh sửa" : "Tạo mới" }]}
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
        {STEPS.map((s, i) => {
          const active = s.n === step;
          const done = s.n < step;
          const locked = surveyLocked && (s.n === 2 || s.n === 3);
          return (
            <div key={s.n} className="flex items-center gap-2">
              <button disabled={locked} onClick={() => setStep(s.n)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                  active ? "bg-blue-600 text-white" : done ? "bg-emerald-50 text-emerald-700" : locked ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${active ? "bg-white text-blue-600" : done ? "bg-emerald-600 text-white" : "bg-slate-300 text-white"}`}>
                  {done ? <Check className="h-3 w-3" /> : s.n}
                </span>
                {s.label}
              </button>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-slate-300" />}
            </div>
          );
        })}
      </div>

      {step === 1 && Step1()}
      {step === 2 && (surveyLocked ? <LockedNotice /> : Step2())}
      {step === 3 && (surveyLocked ? <LockedNotice /> : Step3())}
      {step === 4 && Step4()}
      {step === 5 && Step5()}

      <StepNav />
    </PageContainer>
  );
}

function LockedNotice() {
  return (
    <Card><CardContent className="p-6 text-center text-amber-700 bg-amber-50">
      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
      Khảo sát chưa hoàn thành. Phải hoàn tất khảo sát để mở khoá bước này.
    </CardContent></Card>
  );
}
