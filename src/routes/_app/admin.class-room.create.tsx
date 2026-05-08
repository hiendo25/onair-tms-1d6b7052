import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2, GripVertical, Upload, X, ChevronDown } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useOrg } from "@/lib/org-context";
import { supabase } from "@/integrations/supabase/client";
import { useOnlineCourses, useAssignments, useEmployees } from "@/lib/data-hooks";
import { CLASSROOM_DELIVERY, CLASSROOM_MODE, MEETING_PROVIDER, QR_START_OFFSETS, QR_END_OFFSETS } from "@/lib/admin-options";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  delivery: z.enum(["live", "online", "offline"]).default("live"),
  mode: z.enum(["single", "series"]).default("single"),
});

export const Route = createFileRoute("/_app/admin/class-room/create")({
  head: () => ({ meta: [{ title: "Tạo lớp học — OnAir TMS" }] }),
  validateSearch: searchSchema,
  component: Page,
});

const TOPIC_OPTIONS = [
  "Kỹ năng mềm", "Công nghệ thông tin", "Quản trị", "Bán hàng",
  "Marketing", "Tài chính", "Nhân sự", "Sản xuất", "Tiếng Anh", "Khác",
];

type CourseAssign = {
  course_id: string;
  instructors: { id: string; name: string }[];
  start_at?: string;
  end_at?: string;
};
type Session = {
  title: string;
  start_at?: string;
  end_at?: string;
  location?: string;
  meeting_provider?: string;
  meeting_url?: string;
  description?: string;
  courses: CourseAssign[];
  assignment_ids: string[];
  agenda: AgendaItem[];
};
type AgendaItem = { title: string; start_at: string; end_at: string };

function Page() {
  const { delivery, mode: initialMode } = Route.useSearch();
  const { orgId } = useOrg();
  const navigate = useNavigate();
  const isLive = delivery === "live";
  const isOffline = delivery === "offline";

  const [mode, setMode] = useState<"single" | "series">(initialMode);
  const [tab, setTab] = useState("info");
  const [showCancel, setShowCancel] = useState(false);
  const [tabErrors, setTabErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  // Tab 1: Info
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("");

  // Tab 2: Time (single)
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [location, setLocation] = useState("");
  const [meetingProvider, setMeetingProvider] = useState("zoom");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [meetingPassword, setMeetingPassword] = useState("");
  const [singleCourses, setSingleCourses] = useState<CourseAssign[]>([]);
  const [singleAssignments, setSingleAssignments] = useState<string[]>([]);
  const [singleAgenda, setSingleAgenda] = useState<AgendaItem[]>([]);

  // Tab 2: Time (series)
  const [sameLocation, setSameLocation] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([emptySession(), emptySession()]);

  // Tab 3: Settings
  const { data: employees = [] } = useEmployees();
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [empSearch, setEmpSearch] = useState("");
  const [empBranch, setEmpBranch] = useState("all");
  const [empDept, setEmpDept] = useState("all");
  const [qrStart, setQrStart] = useState(15);
  const [qrEnd, setQrEnd] = useState(15);

  const { data: courses = [] } = useOnlineCourses();
  const { data: assignments = [] } = useAssignments();

  function emptySession(): Session {
    return { title: "", start_at: "", end_at: "", location: "", meeting_provider: "zoom", meeting_url: "", description: "", courses: [], assignment_ids: [], agenda: [] };
  }

  const branches = useMemo(() => Array.from(new Set(employees.map(e => e.branch).filter(Boolean))) as string[], [employees]);
  const depts = useMemo(() => Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[], [employees]);
  const filteredEmps = useMemo(() => {
    const ql = empSearch.trim().toLowerCase();
    return employees.filter(e => {
      if (empBranch !== "all" && e.branch !== empBranch) return false;
      if (empDept !== "all" && e.department !== empDept) return false;
      if (ql && !(e.name?.toLowerCase().includes(ql) || e.email?.toLowerCase().includes(ql) || e.employee_code?.toLowerCase().includes(ql))) return false;
      return true;
    });
  }, [employees, empSearch, empBranch, empDept]);

  function toggleTopic(t: string) {
    setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : (prev.length >= 3 ? prev : [...prev, t]));
  }

  async function uploadCover(file: File) {
    const path = `${orgId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("learning-path-covers").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from("learning-path-covers").getPublicUrl(path);
    setCoverUrl(data.publicUrl);
  }

  // ---- Validation ----
  function validate(): { ok: boolean; errors: Record<string, boolean>; messages: string[] } {
    const errs: Record<string, boolean> = {};
    const msgs: string[] = [];
    if (!title.trim()) { errs.info = true; msgs.push("Tên lớp học bắt buộc"); }
    if (!coverUrl) { errs.info = true; msgs.push("Ảnh bìa bắt buộc"); }
    if (topics.length === 0) { errs.info = true; msgs.push("Chọn ít nhất 1 chủ đề"); }
    if (!isOffline && !description.trim() && !isOffline) { errs.info = true; msgs.push("Nội dung lớp học bắt buộc"); }

    if (mode === "single") {
      const requireTime = isLive || isOffline;
      if (requireTime) {
        if (!startAt || !endAt) { errs.time = true; msgs.push("Thời gian diễn ra bắt buộc"); }
        else if (new Date(endAt).getTime() - new Date(startAt).getTime() < 15 * 60 * 1000) {
          errs.time = true; msgs.push("Thời gian tối thiểu 15 phút");
        }
      }
      if (singleCourses.length === 0) { errs.time = true; msgs.push("Chọn ít nhất 1 khoá học"); }
      if (singleCourses.some(c => c.instructors.length === 0)) { errs.time = true; msgs.push("Mỗi khoá học cần ≥ 1 giảng viên"); }
      if (isLive && !meetingUrl.trim()) { errs.time = true; msgs.push("Link tham gia bắt buộc"); }
      if (isOffline && !location.trim()) { errs.time = true; msgs.push("Địa điểm bắt buộc"); }
    } else {
      if (sessions.length < 2) { errs.time = true; msgs.push("Lớp chuỗi cần ≥ 2 buổi"); }
      sessions.forEach((s, i) => {
        if (!s.title.trim()) { errs.time = true; msgs.push(`Buổi ${i + 1}: tên bắt buộc`); }
        if (s.courses.length === 0) { errs.time = true; msgs.push(`Buổi ${i + 1}: chọn khoá học`); }
        if (isLive && !s.meeting_url) { errs.time = true; msgs.push(`Buổi ${i + 1}: link tham gia`); }
        if (isOffline && !sameLocation && !s.location) { errs.time = true; msgs.push(`Buổi ${i + 1}: địa điểm`); }
      });
      if (isOffline && sameLocation && !location.trim()) { errs.time = true; msgs.push("Địa điểm chuỗi bắt buộc"); }
    }
    return { ok: Object.keys(errs).length === 0, errors: errs, messages: msgs };
  }

  async function publish() {
    const v = validate();
    setTabErrors(v.errors);
    if (!v.ok) {
      toast.error("Thông tin chưa đầy đủ", { description: v.messages[0] });
      const firstErrTab = ["info", "time", "settings"].find(t => v.errors[t]);
      if (firstErrTab) setTab(firstErrTab);
      return;
    }
    setSubmitting(true);
    try {
      const seriesStart = mode === "series" ? sessions.map(s => s.start_at).filter(Boolean).sort()[0] : startAt;
      const seriesEnd = mode === "series" ? sessions.map(s => s.end_at).filter(Boolean).sort().reverse()[0] : endAt;
      const { data: created, error } = await supabase.from("classrooms").insert({
        org_id: orgId, title, code: code || `CR-${Date.now().toString().slice(-6)}`,
        description, instructor: "", location, capacity: 0,
        delivery, mode, type: delivery, status: "upcoming",
        cover_url: coverUrl, topics, objective,
        meeting_provider: meetingProvider, meeting_url: meetingUrl, meeting_id: meetingId, meeting_password: meetingPassword,
        start_at: seriesStart || null, end_at: seriesEnd || null,
        start_date: seriesStart ? seriesStart.slice(0, 10) : null,
        end_date: seriesEnd ? seriesEnd.slice(0, 10) : null,
      } as never).select("id").single();
      if (error || !created) throw error ?? new Error("Insert failed");
      const classroomId = (created as { id: string }).id;

      // Sessions / courses / agenda / assignments
      if (mode === "series") {
        for (let i = 0; i < sessions.length; i++) {
          const s = sessions[i];
          const { data: sess, error: sErr } = await supabase.from("classroom_sessions").insert({
            org_id: orgId, classroom_id: classroomId, session_order: i,
            title: s.title, start_at: s.start_at || null, end_at: s.end_at || null,
            location: isOffline ? (sameLocation ? location : (s.location ?? "")) : "",
            meeting_provider: isLive ? (s.meeting_provider ?? "") : "",
            meeting_url: isLive ? (s.meeting_url ?? "") : "",
            description: s.description ?? "",
          } as never).select("id").single();
          if (sErr) throw sErr;
          const sessionId = (sess as { id: string }).id;
          if (s.courses.length) {
            await supabase.from("classroom_courses").insert(s.courses.map((c, idx) => ({
              org_id: orgId, classroom_id: classroomId, session_id: sessionId,
              course_id: c.course_id, instructors: c.instructors, start_at: c.start_at || null, end_at: c.end_at || null, course_order: idx,
            })) as never);
          }
          if (s.assignment_ids.length) {
            await supabase.from("classroom_assignments").insert(s.assignment_ids.map(aid => ({
              org_id: orgId, classroom_id: classroomId, session_id: sessionId, assignment_id: aid,
            })) as never);
          }
          if (s.agenda.length) {
            await supabase.from("classroom_agenda").insert(s.agenda.map((a, idx) => ({
              org_id: orgId, classroom_id: classroomId, session_id: sessionId,
              title: a.title, start_at: a.start_at, end_at: a.end_at, order_index: idx,
            })) as never);
          }
        }
      } else {
        if (singleCourses.length) {
          await supabase.from("classroom_courses").insert(singleCourses.map((c, idx) => ({
            org_id: orgId, classroom_id: classroomId, course_id: c.course_id,
            instructors: c.instructors, start_at: c.start_at || null, end_at: c.end_at || null, course_order: idx,
          })) as never);
        }
        if (singleAssignments.length) {
          await supabase.from("classroom_assignments").insert(singleAssignments.map(aid => ({
            org_id: orgId, classroom_id: classroomId, assignment_id: aid,
          })) as never);
        }
        if (singleAgenda.length) {
          await supabase.from("classroom_agenda").insert(singleAgenda.map((a, idx) => ({
            org_id: orgId, classroom_id: classroomId, title: a.title, start_at: a.start_at, end_at: a.end_at, order_index: idx,
          })) as never);
        }
      }

      // Students
      if (assignedUserIds.length) {
        await supabase.from("classroom_students").insert(assignedUserIds.map(uid => ({
          org_id: orgId, classroom_id: classroomId, employee_id: uid,
        })) as never);
      }

      // QR
      if (isOffline) {
        await supabase.from("classroom_qr_settings").insert({
          org_id: orgId, classroom_id: classroomId,
          start_offset_minutes: qrStart, end_offset_minutes: qrEnd,
          qr_token: cryptoRandom(),
        } as never);
      }

      toast.success("Đã tạo lớp học");
      navigate({ to: "/admin/class-room" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function tabTriggerCls(key: string) {
    return cn("relative", tabErrors[key] && "data-[state=inactive]:text-rose-600 data-[state=inactive]:after:absolute data-[state=inactive]:after:right-2 data-[state=inactive]:after:top-2 data-[state=inactive]:after:h-1.5 data-[state=inactive]:after:w-1.5 data-[state=inactive]:after:rounded-full data-[state=inactive]:after:bg-rose-600");
  }

  return (
    <PageContainer
      title="Tạo lớp học"
      breadcrumbs={[{ title: "Quản lý lớp học", path: "/admin/class-room" }, { title: "Tạo lớp học" }]}
    >
      <div className="flex items-center justify-between -mt-2">
        <Button variant="ghost" size="sm" onClick={() => setShowCancel(true)}><ArrowLeft className="h-4 w-4" /> Quay lại</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCancel(true)}>Huỷ</Button>
          <Button onClick={publish} disabled={submitting}>{submitting ? "Đang đăng tải..." : "Đăng tải"}</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Loại:</span>
            <Badge variant="outline">{CLASSROOM_DELIVERY.find(d => d.value === delivery)?.label}</Badge>
            <Select value={mode} onValueChange={(v) => setMode(v as never)}>
              <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{CLASSROOM_MODE.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info" className={tabTriggerCls("info")}>1. Thông tin chung</TabsTrigger>
          <TabsTrigger value="time" className={tabTriggerCls("time")}>2. Thời gian</TabsTrigger>
          <TabsTrigger value="settings" className={tabTriggerCls("settings")}>3. Thiết lập</TabsTrigger>
        </TabsList>

        {/* TAB 1 */}
        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Tên lớp học <span className="text-rose-600">*</span></Label>
                  <Input maxLength={100} value={title} onChange={e => setTitle(e.target.value)} placeholder="Tối đa 100 ký tự" />
                </div>
                <div className="space-y-1.5">
                  <Label>Mã lớp</Label>
                  <Input value={code} onChange={e => setCode(e.target.value)} placeholder="Tự sinh nếu để trống" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Ảnh bìa lớp học <span className="text-rose-600">*</span> <span className="text-xs text-muted-foreground">(1152 × 480, jpg/png)</span></Label>
                {coverUrl ? (
                  <div className="relative inline-block">
                    <img src={coverUrl} alt="cover" className="rounded-lg max-h-40" />
                    <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-7 w-7" onClick={() => setCoverUrl("")}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-8 cursor-pointer hover:bg-muted/30">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Bấm để tải ảnh lên</span>
                    <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={e => e.target.files?.[0] && uploadCover(e.target.files[0])} />
                  </label>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Chủ đề <span className="text-rose-600">*</span> <span className="text-xs text-muted-foreground">(tối đa 3)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {TOPIC_OPTIONS.map(t => (
                    <button key={t} type="button" onClick={() => toggleTopic(t)}
                      className={cn("px-3 py-1.5 rounded-full text-xs border transition", topics.includes(t) ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Nội dung lớp học {!isOffline && <span className="text-rose-600">*</span>}</Label>
                <Textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Mục tiêu của lớp học</Label>
                <Textarea rows={3} value={objective} onChange={e => setObjective(e.target.value)} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button onClick={() => setTab("time")}>Tiếp tục</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2 */}
        <TabsContent value="time" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-5">
              {mode === "single" ? (
                <SingleTimePane
                  delivery={delivery}
                  startAt={startAt} setStartAt={setStartAt}
                  endAt={endAt} setEndAt={setEndAt}
                  location={location} setLocation={setLocation}
                  meetingProvider={meetingProvider} setMeetingProvider={setMeetingProvider}
                  meetingUrl={meetingUrl} setMeetingUrl={setMeetingUrl}
                  meetingId={meetingId} setMeetingId={setMeetingId}
                  meetingPassword={meetingPassword} setMeetingPassword={setMeetingPassword}
                  courses={singleCourses} setCourses={setSingleCourses}
                  assignmentIds={singleAssignments} setAssignmentIds={setSingleAssignments}
                  agenda={singleAgenda} setAgenda={setSingleAgenda}
                  allCourses={courses} allAssignments={assignments} allEmployees={employees}
                />
              ) : (
                <SeriesTimePane
                  delivery={delivery}
                  sessions={sessions} setSessions={setSessions}
                  sameLocation={sameLocation} setSameLocation={setSameLocation}
                  location={location} setLocation={setLocation}
                  allCourses={courses} allAssignments={assignments} allEmployees={employees}
                />
              )}
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setTab("info")}>Quay lại</Button>
                <Button onClick={() => setTab("settings")}>Tiếp tục</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3 */}
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Gán học viên vào lớp học</h3>
                <div className="grid md:grid-cols-3 gap-3 mb-3">
                  <Select value={empBranch} onValueChange={setEmpBranch}>
                    <SelectTrigger><SelectValue placeholder="Chi nhánh" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                      {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={empDept} onValueChange={setEmpDept}>
                    <SelectTrigger><SelectValue placeholder="Phòng ban" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả phòng ban</SelectItem>
                      {depts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input value={empSearch} onChange={e => setEmpSearch(e.target.value)} placeholder="Tìm theo họ tên, mã, email..." />
                </div>
                <div className="border rounded-lg max-h-72 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 sticky top-0">
                      <tr>
                        <th className="p-2 w-10"><Checkbox
                          checked={filteredEmps.length > 0 && filteredEmps.every(e => assignedUserIds.includes(e.id))}
                          onCheckedChange={(v) => setAssignedUserIds(v ? Array.from(new Set([...assignedUserIds, ...filteredEmps.map(e => e.id)])) : assignedUserIds.filter(id => !filteredEmps.find(e => e.id === id)))}
                        /></th>
                        <th className="p-2 text-left">Họ tên</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Phòng ban</th>
                        <th className="p-2 text-left">Chi nhánh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmps.map(e => (
                        <tr key={e.id} className="border-t hover:bg-muted/20">
                          <td className="p-2"><Checkbox
                            checked={assignedUserIds.includes(e.id)}
                            onCheckedChange={(v) => setAssignedUserIds(v ? [...assignedUserIds, e.id] : assignedUserIds.filter(id => id !== e.id))}
                          /></td>
                          <td className="p-2">{e.name}</td>
                          <td className="p-2 text-muted-foreground">{e.email}</td>
                          <td className="p-2">{e.department}</td>
                          <td className="p-2">{e.branch}</td>
                        </tr>
                      ))}
                      {filteredEmps.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Không có học viên</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="text-sm text-muted-foreground mt-2">Đã chọn {assignedUserIds.length} học viên</div>
              </div>

              {isOffline && (
                <div className="border-t pt-5">
                  <h3 className="font-semibold mb-3">Thiết lập mã QR điểm danh</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Thời gian bắt đầu điểm danh</Label>
                      <Select value={String(qrStart)} onValueChange={(v) => setQrStart(Number(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{QR_START_OFFSETS.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Thời gian kết thúc điểm danh</Label>
                      <Select value={String(qrEnd)} onValueChange={(v) => setQrEnd(Number(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{QR_END_OFFSETS.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Mã QR sẽ được sinh tự động sau khi đăng tải lớp học. Học viên cần ở trong bán kính ≤ 200m và thuộc danh sách được gán để điểm danh thành công.</p>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setTab("time")}>Quay lại</Button>
                <Button onClick={publish} disabled={submitting}>{submitting ? "Đang đăng tải..." : "Đăng tải"}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Huỷ tạo lớp học?</AlertDialogTitle>
            <AlertDialogDescription>Mọi thay đổi chưa lưu sẽ bị mất.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate({ to: "/admin/class-room" })}>Huỷ tạo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// =============== Sub-panes ===============

type Course = { id: string; title: string };
type Assignment = { id: string; title: string };
type Employee = { id: string; name: string; position?: string };

function CourseAssignList({
  delivery, courses, setCourses, allCourses, allEmployees,
}: {
  delivery: string;
  courses: CourseAssign[];
  setCourses: (cs: CourseAssign[]) => void;
  allCourses: Course[];
  allEmployees: Employee[];
}) {
  function add() { setCourses([...courses, { course_id: "", instructors: [], start_at: "", end_at: "" }]); }
  function update(i: number, patch: Partial<CourseAssign>) { setCourses(courses.map((c, idx) => idx === i ? { ...c, ...patch } : c)); }
  function remove(i: number) { setCourses(courses.filter((_, idx) => idx !== i)); }
  function toggleInstructor(i: number, emp: Employee) {
    const cur = courses[i];
    const has = cur.instructors.find(x => x.id === emp.id);
    update(i, { instructors: has ? cur.instructors.filter(x => x.id !== emp.id) : [...cur.instructors, { id: emp.id, name: emp.name }] });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Khoá học <span className="text-rose-600">*</span></Label>
        <Button size="sm" variant="outline" onClick={add}><Plus className="h-3.5 w-3.5" /> Thêm khoá học</Button>
      </div>
      {courses.length === 0 && <div className="text-sm text-muted-foreground border rounded p-3">Chưa có khoá học. Bấm "Thêm khoá học" để gán.</div>}
      {courses.map((c, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/20">
          <div className="flex gap-2 items-start">
            <Select value={c.course_id} onValueChange={(v) => update(i, { course_id: v })}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Chọn khoá học" /></SelectTrigger>
              <SelectContent>{allCourses.map(co => <SelectItem key={co.id} value={co.id}>{co.title}</SelectItem>)}</SelectContent>
            </Select>
            <Button size="icon" variant="ghost" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-rose-600" /></Button>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Bắt đầu khoá học</Label>
              <Input type="datetime-local" value={c.start_at ?? ""} onChange={e => update(i, { start_at: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Kết thúc khoá học</Label>
              <Input type="datetime-local" value={c.end_at ?? ""} onChange={e => update(i, { end_at: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Giảng viên phụ trách <span className="text-rose-600">*</span></Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {c.instructors.map(ins => (
                <Badge key={ins.id} variant="secondary" className="gap-1">{ins.name} <button onClick={() => toggleInstructor(i, ins)}><X className="h-3 w-3" /></button></Badge>
              ))}
              <Select value="" onValueChange={(v) => { const emp = allEmployees.find(e => e.id === v); if (emp) toggleInstructor(i, emp); }}>
                <SelectTrigger className="h-7 w-44"><SelectValue placeholder="+ Thêm giảng viên" /></SelectTrigger>
                <SelectContent className="max-h-60">{allEmployees.filter(e => !c.instructors.find(x => x.id === e.id)).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AssignmentList({ ids, setIds, all }: { ids: string[]; setIds: (v: string[]) => void; all: Assignment[] }) {
  return (
    <div className="space-y-2">
      <Label>Bài kiểm tra lớp học</Label>
      <div className="flex flex-wrap gap-1.5">
        {ids.map(id => {
          const a = all.find(x => x.id === id);
          return <Badge key={id} variant="secondary" className="gap-1">{a?.title ?? id} <button onClick={() => setIds(ids.filter(x => x !== id))}><X className="h-3 w-3" /></button></Badge>;
        })}
        <Select value="" onValueChange={(v) => !ids.includes(v) && setIds([...ids, v])}>
          <SelectTrigger className="h-8 w-56"><SelectValue placeholder="+ Thêm bài kiểm tra" /></SelectTrigger>
          <SelectContent className="max-h-60">{all.filter(a => !ids.includes(a.id)).map(a => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}

function AgendaList({ items, setItems }: { items: AgendaItem[]; setItems: (v: AgendaItem[]) => void }) {
  function add() { setItems([...items, { title: "", start_at: "", end_at: "" }]); }
  function update(i: number, patch: Partial<AgendaItem>) { setItems(items.map((x, idx) => idx === i ? { ...x, ...patch } : x)); }
  function remove(i: number) { setItems(items.filter((_, idx) => idx !== i)); }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between"><Label>Agenda buổi học</Label>
        <Button size="sm" variant="outline" onClick={add}><Plus className="h-3.5 w-3.5" /> Thêm</Button></div>
      {items.map((a, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end border rounded p-2 bg-muted/10">
          <div><Label className="text-xs">Tiêu đề</Label><Input value={a.title} onChange={e => update(i, { title: e.target.value })} /></div>
          <div><Label className="text-xs">Bắt đầu</Label><Input type="datetime-local" value={a.start_at} onChange={e => update(i, { start_at: e.target.value })} /></div>
          <div><Label className="text-xs">Kết thúc</Label><Input type="datetime-local" value={a.end_at} onChange={e => update(i, { end_at: e.target.value })} /></div>
          <Button size="icon" variant="ghost" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-rose-600" /></Button>
        </div>
      ))}
    </div>
  );
}

function MeetingFields({
  provider, setProvider, url, setUrl, id, setId, password, setPassword,
}: {
  provider: string; setProvider: (v: string) => void;
  url: string; setUrl: (v: string) => void;
  id: string; setId: (v: string) => void;
  password: string; setPassword: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Link tham gia <span className="text-rose-600">*</span></Label>
      <div className="grid md:grid-cols-[200px_1fr] gap-2">
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{MEETING_PROVIDER.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
      </div>
      {provider === "zoom" && (
        <div className="grid md:grid-cols-2 gap-2">
          <Input value={id} onChange={e => setId(e.target.value)} placeholder="Meeting ID" />
          <Input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        </div>
      )}
    </div>
  );
}

function SingleTimePane(props: {
  delivery: string;
  startAt: string; setStartAt: (v: string) => void;
  endAt: string; setEndAt: (v: string) => void;
  location: string; setLocation: (v: string) => void;
  meetingProvider: string; setMeetingProvider: (v: string) => void;
  meetingUrl: string; setMeetingUrl: (v: string) => void;
  meetingId: string; setMeetingId: (v: string) => void;
  meetingPassword: string; setMeetingPassword: (v: string) => void;
  courses: CourseAssign[]; setCourses: (v: CourseAssign[]) => void;
  assignmentIds: string[]; setAssignmentIds: (v: string[]) => void;
  agenda: AgendaItem[]; setAgenda: (v: AgendaItem[]) => void;
  allCourses: Course[]; allAssignments: Assignment[]; allEmployees: Employee[];
}) {
  const isLive = props.delivery === "live";
  const isOnline = props.delivery === "online";
  const isOffline = props.delivery === "offline";
  const timeRequired = isLive || isOffline;
  return (
    <div className="space-y-5">
      <div>
        <Label>Thời gian diễn ra {timeRequired && <span className="text-rose-600">*</span>}
          {isOnline && <span className="text-xs text-muted-foreground ml-2">(không bắt buộc — bỏ trống = vô thời hạn)</span>}
        </Label>
        <div className="grid md:grid-cols-2 gap-2 mt-1.5">
          <Input type="datetime-local" value={props.startAt} onChange={e => props.setStartAt(e.target.value)} />
          <Input type="datetime-local" value={props.endAt} onChange={e => props.setEndAt(e.target.value)} />
        </div>
      </div>

      {isOffline && (
        <div className="space-y-1.5"><Label>Địa điểm tổ chức <span className="text-rose-600">*</span></Label>
          <Input value={props.location} onChange={e => props.setLocation(e.target.value)} placeholder="Tên/địa chỉ phòng học" /></div>
      )}

      {isLive && (
        <MeetingFields
          provider={props.meetingProvider} setProvider={props.setMeetingProvider}
          url={props.meetingUrl} setUrl={props.setMeetingUrl}
          id={props.meetingId} setId={props.setMeetingId}
          password={props.meetingPassword} setPassword={props.setMeetingPassword}
        />
      )}

      <CourseAssignList delivery={props.delivery} courses={props.courses} setCourses={props.setCourses} allCourses={props.allCourses} allEmployees={props.allEmployees} />
      <AssignmentList ids={props.assignmentIds} setIds={props.setAssignmentIds} all={props.allAssignments} />
      <AgendaList items={props.agenda} setItems={props.setAgenda} />
    </div>
  );
}

function SeriesTimePane(props: {
  delivery: string;
  sessions: Session[]; setSessions: (v: Session[]) => void;
  sameLocation: boolean; setSameLocation: (v: boolean) => void;
  location: string; setLocation: (v: string) => void;
  allCourses: Course[]; allAssignments: Assignment[]; allEmployees: Employee[];
}) {
  const isOffline = props.delivery === "offline";
  const isLive = props.delivery === "live";
  const [openIdx, setOpenIdx] = useState<number[]>([0, 1]);
  function toggleOpen(i: number) { setOpenIdx(openIdx.includes(i) ? openIdx.filter(x => x !== i) : [...openIdx, i]); }
  function addSession() { props.setSessions([...props.sessions, emptySession()]); setOpenIdx([...openIdx, props.sessions.length]); }
  function removeSession(i: number) {
    if (props.sessions.length <= 2) { toast.error("Lớp chuỗi phải có ít nhất 2 buổi"); return; }
    props.setSessions(props.sessions.filter((_, idx) => idx !== i));
  }
  function update(i: number, patch: Partial<Session>) { props.setSessions(props.sessions.map((s, idx) => idx === i ? { ...s, ...patch } : s)); }
  function emptySession(): Session {
    return { title: "", start_at: "", end_at: "", location: "", meeting_provider: "zoom", meeting_url: "", description: "", courses: [], assignment_ids: [], agenda: [] };
  }

  return (
    <div className="space-y-4">
      {isOffline && (
        <div className="border rounded-lg p-3 bg-muted/20 space-y-2">
          <Label>Địa điểm tổ chức <span className="text-rose-600">*</span></Label>
          <Select value={props.sameLocation ? "same" : "diff"} onValueChange={(v) => props.setSameLocation(v === "same")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="same">Chuỗi lớp học có cùng địa điểm</SelectItem>
              <SelectItem value="diff">Chuỗi lớp học không cùng địa điểm</SelectItem>
            </SelectContent>
          </Select>
          {props.sameLocation && <Input value={props.location} onChange={e => props.setLocation(e.target.value)} placeholder="Địa điểm chung cho chuỗi" />}
        </div>
      )}

      {props.sessions.map((s, i) => {
        const open = openIdx.includes(i);
        return (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 p-3 bg-muted/30">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              <button onClick={() => toggleOpen(i)} className="flex-1 text-left flex items-center gap-2">
                <ChevronDown className={cn("h-4 w-4 transition", !open && "-rotate-90")} />
                <span className="font-medium">Buổi {i + 1}: {s.title || <span className="text-muted-foreground italic">chưa đặt tên</span>}</span>
              </button>
              <Button size="icon" variant="ghost" onClick={() => removeSession(i)}><Trash2 className="h-4 w-4 text-rose-600" /></Button>
            </div>
            {open && (
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <Label>Tên buổi học <span className="text-rose-600">*</span></Label>
                  <Input maxLength={100} value={s.title} onChange={e => update(i, { title: e.target.value })} />
                </div>
                <div>
                  <Label>Thời gian diễn ra {(isLive || isOffline) && <span className="text-rose-600">*</span>}</Label>
                  <div className="grid md:grid-cols-2 gap-2 mt-1.5">
                    <Input type="datetime-local" value={s.start_at ?? ""} onChange={e => update(i, { start_at: e.target.value })} />
                    <Input type="datetime-local" value={s.end_at ?? ""} onChange={e => update(i, { end_at: e.target.value })} />
                  </div>
                </div>
                {isOffline && !props.sameLocation && (
                  <div className="space-y-1.5"><Label>Địa điểm tổ chức <span className="text-rose-600">*</span></Label>
                    <Input value={s.location ?? ""} onChange={e => update(i, { location: e.target.value })} /></div>
                )}
                {isLive && (
                  <MeetingFields
                    provider={s.meeting_provider ?? "zoom"} setProvider={(v) => update(i, { meeting_provider: v })}
                    url={s.meeting_url ?? ""} setUrl={(v) => update(i, { meeting_url: v })}
                    id={""} setId={() => {}} password={""} setPassword={() => {}}
                  />
                )}
                <CourseAssignList delivery={props.delivery} courses={s.courses} setCourses={(cs) => update(i, { courses: cs })} allCourses={props.allCourses} allEmployees={props.allEmployees} />
                <AssignmentList ids={s.assignment_ids} setIds={(v) => update(i, { assignment_ids: v })} all={props.allAssignments} />
                <div className="space-y-1.5"><Label>Nội dung</Label><Textarea rows={2} value={s.description ?? ""} onChange={e => update(i, { description: e.target.value })} /></div>
                <AgendaList items={s.agenda} setItems={(v) => update(i, { agenda: v })} />
              </div>
            )}
          </div>
        );
      })}

      <Button variant="outline" onClick={addSession}><Plus className="h-4 w-4" /> Thêm buổi học</Button>
    </div>
  );
}
