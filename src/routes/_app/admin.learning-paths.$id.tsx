import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Pencil, Users, BookOpen, Clock, CheckCircle2, Lock, Unlock, History, ClipboardList } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  useLearningPaths, useLearningPathMutations, useLpStages, useLpStageCourses,
  useLpStageAssignments, useLpSettings, useLpAudience, useLpEnrollments, useLpVersions,
  useOnlineCourses, useAssignments,
} from "@/lib/data-hooks";
import { PATH_STATUS, LP_AUDIENCE_TYPE, LP_ENROLLMENT_STATUS } from "@/lib/admin-options";

export const Route = createFileRoute("/_app/admin/learning-paths/$id")({
  notFoundComponent: () => <PageContainer title="Không tìm thấy lộ trình"><Button asChild variant="outline"><Link to="/admin/learning-paths"><ArrowLeft className="h-4 w-4" /> Quay lại</Link></Button></PageContainer>,
  component: LearningPathDetail,
});

const labelOf = (opts: { value: string; label: string }[], v: string) => opts.find(o => o.value === v)?.label ?? v;

function LearningPathDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: paths = [], isLoading: pLoading } = useLearningPaths();
  const path = useMemo(() => paths.find(p => p.id === id), [paths, id]);
  const m = useLearningPathMutations();

  const { data: stages = [], isLoading: stLoading } = useLpStages(id);
  const stageIds = useMemo(() => stages.map(s => s.id), [stages]);
  const { data: stageCourses = [] } = useLpStageCourses(stageIds);
  const { data: stageAssigns = [] } = useLpStageAssignments(stageIds);
  const { data: settingsRows = [] } = useLpSettings(id);
  const { data: audience = [] } = useLpAudience(id);
  const { data: enrollments = [] } = useLpEnrollments(id);
  const { data: versions = [] } = useLpVersions(id);
  const { data: courses = [] } = useOnlineCourses();
  const { data: assignments = [] } = useAssignments();

  if (pLoading) return <PageContainer title="Đang tải..."><Skeleton className="h-96" /></PageContainer>;
  if (!path) return null;
  const settings = settingsRows[0];

  const totalCourses = stageCourses.length;
  const avgProgress = enrollments.length === 0 ? 0 : Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length);
  const completed = enrollments.filter(e => e.status === "completed").length;

  async function toggleLock() {
    if (!path) return;
    const next = path.status === "locked" ? "active" : "locked";
    try { await m.update.mutateAsync({ id: path.id, status: next } as never); toast.success(next === "locked" ? "Đã khoá lộ trình" : "Đã mở khoá"); }
    catch { /* handled */ }
  }

  return (
    <PageContainer
      title={path.title}
      breadcrumbs={[{ title: "Lộ trình học tập", path: "/admin/learning-paths" }, { title: path.title }]}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={toggleLock}>
            {path.status === "locked" ? <><Unlock className="h-4 w-4" /> Mở khoá</> : <><Lock className="h-4 w-4" /> Khoá</>}
          </Button>
          <Button size="sm" onClick={() => navigate({ to: "/admin/learning-paths/edit/$id", params: { id: path.id } })} disabled={path.status === "locked"}>
            <Pencil className="h-4 w-4" /> Chỉnh sửa
          </Button>
        </div>
      }
    >
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-violet-600 p-6 text-white">
          <Badge className="bg-white/20 text-white hover:bg-white/30">{labelOf(PATH_STATUS, path.status)} · v{path.version ?? 1}</Badge>
          <h2 className="mt-3 text-3xl font-semibold">{path.title}</h2>
          {path.description && <p className="mt-2 max-w-2xl text-sm text-white/80">{path.description}</p>}
          <div className="mt-5 flex flex-wrap gap-6 text-sm">
            <span className="flex items-center gap-2"><Users className="h-4 w-4" />{enrollments.length} học viên</span>
            <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" />{totalCourses} khoá học</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{path.duration_hours ?? 0}h</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{stages.length} giai đoạn</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Đã ghi danh</div><div className="text-2xl font-bold">{enrollments.length}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Hoàn thành</div><div className="text-2xl font-bold">{completed}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Tiến độ TB</div><div className="text-2xl font-bold">{avgProgress}%</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Phiên bản</div><div className="text-2xl font-bold">v{path.version ?? 1}</div></CardContent></Card>
      </div>

      <Tabs defaultValue="stages">
        <TabsList>
          <TabsTrigger value="stages">Giai đoạn ({stages.length})</TabsTrigger>
          <TabsTrigger value="enrollments">Học viên ({enrollments.length})</TabsTrigger>
          <TabsTrigger value="audience">Đối tượng ({audience.length})</TabsTrigger>
          <TabsTrigger value="settings">Cấu hình</TabsTrigger>
          <TabsTrigger value="versions">Lịch sử ({versions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="stages" className="space-y-4">
          {stLoading ? <Skeleton className="h-40" /> : stages.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Chưa có giai đoạn nào.</CardContent></Card>
          ) : (
            <div className="relative space-y-4 border-l-2 border-dashed border-border pl-8">
              {stages.map((s, i) => {
                const sCourses = stageCourses.filter(c => c.stage_id === s.id);
                const sAssigns = stageAssigns.filter(a => a.stage_id === s.id);
                return (
                  <div key={s.id} className="relative">
                    <div className="absolute -left-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">{i + 1}</div>
                    <Card>
                      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                        <div>
                          <CardTitle className="text-lg">{s.name}</CardTitle>
                          {s.description && <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary"><BookOpen className="h-3 w-3" />{sCourses.length} khoá</Badge>
                          <Badge variant="outline"><ClipboardList className="h-3 w-3" />{sAssigns.length} bài KT</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {sCourses.length > 0 && (
                          <div className="space-y-1.5">
                            {sCourses.map(c => {
                              const co = courses.find(x => x.id === c.course_id);
                              return (
                                <div key={c.id} className="flex items-center gap-3 rounded-md border bg-muted/30 p-2 text-sm">
                                  <BookOpen className="h-4 w-4 text-primary" />
                                  <span className="flex-1">{co?.title ?? "Khoá học không tồn tại"}</span>
                                  <span className="text-xs text-muted-foreground">{co?.duration_minutes ?? 0} phút</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {sAssigns.length > 0 && (
                          <div className="space-y-1.5">
                            {sAssigns.map(a => {
                              const as = assignments.find(x => x.id === a.assignment_id);
                              return (
                                <div key={a.id} className="flex items-center gap-3 rounded-md border bg-amber-50/40 p-2 text-sm">
                                  <ClipboardList className="h-4 w-4 text-amber-600" />
                                  <span className="flex-1">{as?.title ?? "Bài KT không tồn tại"}</span>
                                  {a.required && <Badge variant="outline" className="text-[10px]">Bắt buộc</Badge>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrollments">
          <Card>
            <CardContent className="p-0">
              {enrollments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Chưa có học viên ghi danh.</div>
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Học viên</TableHead><TableHead>Trạng thái</TableHead>
                    <TableHead>Tiến độ</TableHead><TableHead>Bắt đầu</TableHead><TableHead>Hạn</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {enrollments.map(e => (
                      <TableRow key={e.id}>
                        <TableCell className="font-mono text-xs">{e.user_id.slice(0, 8)}...</TableCell>
                        <TableCell><Badge variant="outline">{labelOf(LP_ENROLLMENT_STATUS, e.status)}</Badge></TableCell>
                        <TableCell><div className="flex items-center gap-2"><Progress value={e.progress} className="h-1.5 w-24" /><span className="text-xs">{e.progress}%</span></div></TableCell>
                        <TableCell className="text-xs">{e.started_at ? new Date(e.started_at).toLocaleDateString("vi-VN") : "-"}</TableCell>
                        <TableCell className="text-xs">{e.deadline ? new Date(e.deadline).toLocaleDateString("vi-VN") : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience">
          <Card>
            <CardContent className="p-4">
              {audience.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">Chưa cấu hình đối tượng — không tự động ghi danh.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {audience.map(a => (
                    <Badge key={a.id} variant="secondary">{labelOf(LP_AUDIENCE_TYPE, a.target_type)}{a.target_id ? `: ${a.target_id.slice(0, 8)}...` : ""}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent className="p-4 grid gap-3 md:grid-cols-2 text-sm">
              <div><span className="text-muted-foreground">Học tuần tự:</span> <strong>{settings?.sequential_mode ? "Có" : "Không"}</strong></div>
              <div><span className="text-muted-foreground">Cho phép học lại:</span> <strong>{settings?.allow_retake ? "Có" : "Không"}</strong></div>
              <div><span className="text-muted-foreground">Ngưỡng hoàn thành:</span> <strong>{settings?.completion_threshold ?? 100}%</strong></div>
              <div><span className="text-muted-foreground">Hạn (ngày):</span> <strong>{settings?.deadline_days ?? "Không giới hạn"}</strong></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions">
          <Card>
            <CardContent className="p-0">
              {versions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Chưa có lịch sử phiên bản.</div>
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Phiên bản</TableHead><TableHead>Ghi chú</TableHead><TableHead>Thời gian</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {versions.map(v => (
                      <TableRow key={v.id}>
                        <TableCell><Badge variant="outline"><History className="h-3 w-3" /> v{v.version}</Badge></TableCell>
                        <TableCell>{v.change_note}</TableCell>
                        <TableCell className="text-xs">{new Date(v.changed_at).toLocaleString("vi-VN")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
