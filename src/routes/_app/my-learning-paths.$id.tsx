import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArrowLeft, BookOpen, Clock, Lock, CheckCircle2, PlayCircle, FileQuestion, Calendar } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  useLpStages, useLpStageCourses, useLpStageAssignments, useLpSettings,
  useOnlineCourses, useAssignments,
} from "@/lib/data-hooks";

export const Route = createFileRoute("/_app/my-learning-paths/$id")({
  head: () => ({ meta: [{ title: "Chi tiết lộ trình — OnAir TMS" }] }),
  component: MyPathDetail,
});

function MyPathDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();

  const { data: lp, isLoading: lpLoading } = useQuery({
    queryKey: ["my-lp-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("learning_paths").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: enrollment } = useQuery({
    queryKey: ["my-lp-enrollment", id, user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_path_enrollments")
        .select("*").eq("learning_path_id", id).eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: stages = [] } = useLpStages(id);
  const stageIds = useMemo(() => stages.map(s => s.id), [stages]);
  const { data: stageCourses = [] } = useLpStageCourses(stageIds);
  const { data: stageAssigns = [] } = useLpStageAssignments(stageIds);
  const { data: settingsRows = [] } = useLpSettings(id);
  const { data: courses = [] } = useOnlineCourses();
  const { data: assignments = [] } = useAssignments();

  const allCourseIds = stageCourses.map(c => c.course_id);
  const allAssignmentIds = stageAssigns.map(a => a.assignment_id);

  const { data: doneCoursesSet } = useQuery({
    queryKey: ["lp-done-courses", user?.id, allCourseIds.join(",")],
    enabled: !!user?.id && allCourseIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("course_enrollments")
        .select("course_id, status, progress").eq("user_id", user!.id).in("course_id", allCourseIds);
      if (error) throw error;
      return new Set((data ?? []).filter(r => r.status === "completed" || (r.progress ?? 0) >= 100).map(r => r.course_id as string));
    },
  });

  const { data: doneAssignsSet } = useQuery({
    queryKey: ["lp-done-assigns", user?.id, allAssignmentIds.join(",")],
    enabled: !!user?.id && allAssignmentIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("assignment_submissions")
        .select("assignment_id, status").eq("user_id", user!.id).in("assignment_id", allAssignmentIds);
      if (error) throw error;
      return new Set((data ?? []).filter(r => r.status === "completed" || r.status === "passed").map(r => r.assignment_id as string));
    },
  });

  const settings = settingsRows[0];
  const sequential = settings?.sequential_mode ?? false;
  const cDone = doneCoursesSet ?? new Set<string>();
  const aDone = doneAssignsSet ?? new Set<string>();

  const stageStats = stages.map(s => {
    const sc = stageCourses.filter(x => x.stage_id === s.id);
    const sa = stageAssigns.filter(x => x.stage_id === s.id);
    const total = sc.length + sa.length;
    const done = sc.filter(x => cDone.has(x.course_id)).length + sa.filter(x => aDone.has(x.assignment_id)).length;
    return { stage: s, sc, sa, total, done, completed: total > 0 && done === total };
  });

  if (lpLoading) return <PageContainer title="Đang tải..."><Skeleton className="h-96" /></PageContainer>;
  if (!lp) return (
    <PageContainer title="Không tìm thấy">
      <Button asChild variant="outline"><Link to="/my-learning-paths"><ArrowLeft className="h-4 w-4" /> Quay lại</Link></Button>
    </PageContainer>
  );

  const locked = lp.status === "locked";
  const overallProgress = enrollment?.progress ?? 0;

  return (
    <PageContainer
      title={lp.title}
      breadcrumbs={[{ title: "Lộ trình của tôi", path: "/my-learning-paths" }, { title: lp.title }]}
    >
      <Card className="overflow-hidden">
        <div className="relative h-40 bg-gradient-to-br from-primary to-violet-600">
          {lp.cover_url && <img src={lp.cover_url} alt={lp.title} className="h-full w-full object-cover opacity-60" />}
          <div className="absolute inset-0 p-6 text-white flex flex-col justify-end">
            <Badge className="self-start bg-white/20 text-white">{lp.code}</Badge>
            <h2 className="mt-2 text-2xl font-semibold">{lp.title}</h2>
            {lp.description && <p className="mt-1 text-sm text-white/90 line-clamp-2">{lp.description}</p>}
          </div>
        </div>
        <CardContent className="p-5 space-y-3">
          {locked && (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900 flex items-center gap-2">
              <Lock className="h-4 w-4" /> Lộ trình đang bị khoá. Bạn không thể tiếp tục học.
            </div>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{lp.courses_count ?? 0} khoá học</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{lp.duration_hours ?? 0}h</span>
            {enrollment?.deadline && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Hạn {new Date(enrollment.deadline).toLocaleDateString("vi-VN")}</span>}
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1"><span>Tiến độ tổng</span><span className="font-semibold">{overallProgress}%</span></div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Giai đoạn học tập</h3>
      <div className="relative space-y-4 border-l-2 border-dashed border-border pl-8">
        {stageStats.map(({ stage, sc, sa, total, done, completed }, i) => {
          const prevCompleted = i === 0 || stageStats[i - 1].completed;
          const stageLocked = locked || (sequential && !prevCompleted);
          const progress = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <div key={stage.id} className="relative">
              <div className={`absolute -left-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white ${completed ? "bg-emerald-600" : stageLocked ? "bg-slate-400" : "bg-primary"}`}>
                {completed ? <CheckCircle2 className="h-4 w-4" /> : stageLocked ? <Lock className="h-3 w-3" /> : i + 1}
              </div>
              <Card className={stageLocked ? "opacity-70" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Giai đoạn {i + 1}: {stage.name}</span>
                    <Badge variant={completed ? "secondary" : "outline"}>{done}/{total} • {progress}%</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stage.description && <p className="text-xs text-muted-foreground">{stage.description}</p>}
                  <Progress value={progress} className="h-1.5" />
                  <div className="space-y-1.5">
                    {sc.map(c => {
                      const co = courses.find(x => x.id === c.course_id);
                      const cdone = cDone.has(c.course_id);
                      return (
                        <div key={c.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                          {cdone ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <PlayCircle className="h-4 w-4 text-primary" />}
                          <span className="flex-1 truncate">{co?.title ?? "Khoá học"}</span>
                          <span className="text-xs text-muted-foreground">{co?.duration_minutes ?? 0}p</span>
                        </div>
                      );
                    })}
                    {sa.map(a => {
                      const as = assignments.find(x => x.id === a.assignment_id);
                      const adone = aDone.has(a.assignment_id);
                      return (
                        <div key={a.id} className="flex items-center gap-2 rounded-md border bg-amber-50/30 p-2 text-sm">
                          {adone ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <FileQuestion className="h-4 w-4 text-amber-600" />}
                          <span className="flex-1 truncate">{as?.title ?? "Bài kiểm tra"}</span>
                          {a.required && <Badge variant="outline" className="text-[10px]">Bắt buộc</Badge>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-1">
                    <Button asChild size="sm" disabled={stageLocked}>
                      <Link to="/my-learning-paths/phase/$id" params={{ id: stage.id }}>
                        {completed ? "Xem lại" : "Vào giai đoạn"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
        {stages.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Lộ trình chưa có giai đoạn nào.</CardContent></Card>
        )}
      </div>
    </PageContainer>
  );
}
