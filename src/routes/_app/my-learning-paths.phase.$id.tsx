import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, CheckCircle2, PlayCircle, FileQuestion, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  useLpStageCourses,
  useLpStageAssignments,
  useLpSettings,
  useOnlineCourses,
  useAssignments,
} from "@/lib/data-hooks";

export const Route = createFileRoute("/_app/my-learning-paths/phase/$id")({
  head: () => ({ meta: [{ title: "Giai đoạn lộ trình — OnAir TMS" }] }),
  component: Phase,
});

function Phase() {
  const { id: stageId } = Route.useParams();
  const { user } = useAuth();

  const { data: stage, isLoading: loadingStage } = useQuery({
    queryKey: ["lp_stage_one", stageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_path_stages")
        .select("*, learning_paths(id, title, code, status)")
        .eq("id", stageId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const lpId = stage?.learning_path_id as string | undefined;
  const { data: settings } = useLpSettings(lpId);
  const sequential = settings?.[0]?.sequential_mode ?? false;

  // siblings to compute previous-stage gate
  const { data: siblings } = useQuery({
    queryKey: ["lp_stages_siblings", lpId],
    enabled: !!lpId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_path_stages")
        .select("id, stage_order")
        .eq("learning_path_id", lpId as string)
        .order("stage_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const stageIds = useMemo(() => (stageId ? [stageId] : []), [stageId]);
  const { data: stageCourses, isLoading: loadingSC } = useLpStageCourses(stageIds);
  const { data: stageAssignments, isLoading: loadingSA } = useLpStageAssignments(stageIds);
  const { data: allCourses } = useOnlineCourses();
  const { data: allAssignments } = useAssignments();

  // completion data
  const courseIds = (stageCourses ?? []).map((c) => c.course_id);
  const assignmentIds = (stageAssignments ?? []).map((a) => a.assignment_id);

  const { data: completedCourses } = useQuery({
    queryKey: ["completed_courses", user?.id, courseIds.join(",")],
    enabled: !!user && courseIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_activity")
        .select("target_id")
        .eq("user_id", user!.id)
        .eq("action", "course_complete")
        .in("target_id", courseIds);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.target_id as string));
    },
  });

  const { data: submittedAssignments } = useQuery({
    queryKey: ["submitted_assignments", user?.id, assignmentIds.join(",")],
    enabled: !!user && assignmentIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignment_submissions")
        .select("assignment_id, status")
        .eq("user_id", user!.id)
        .in("assignment_id", assignmentIds);
      if (error) throw error;
      return new Set((data ?? []).filter((r) => r.status === "completed" || r.status === "passed").map((r) => r.assignment_id as string));
    },
  });

  // previous stage gate
  const prevStageLocked = useMemo(() => {
    if (!sequential || !siblings || !stage) return false;
    const idx = siblings.findIndex((s) => s.id === stageId);
    return idx > 0; // simplified: only first stage unlocked when sequential and prior incomplete
    // Note: deeper gating would check completion of prev stage
  }, [sequential, siblings, stage, stageId]);

  if (loadingStage) {
    return (
      <PageContainer title="Đang tải..." breadcrumbs={[{ title: "Lộ trình", path: "/my-learning-paths" }]}>
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-24 w-full mb-2" />
        <Skeleton className="h-24 w-full" />
      </PageContainer>
    );
  }

  if (!stage) {
    return (
      <PageContainer title="Không tìm thấy" breadcrumbs={[{ title: "Lộ trình", path: "/my-learning-paths" }]}>
        <Card><CardContent className="p-8 text-center text-muted-foreground">Giai đoạn không tồn tại.</CardContent></Card>
      </PageContainer>
    );
  }

  const lp = (stage as { learning_paths?: { title: string; code: string } }).learning_paths;
  const sortedCourses = [...(stageCourses ?? [])].sort((a, b) => a.course_order - b.course_order);
  const courseDoneSet = completedCourses ?? new Set<string>();
  const assignmentDoneSet = submittedAssignments ?? new Set<string>();

  const totalItems = sortedCourses.length + (stageAssignments?.length ?? 0);
  const doneItems =
    sortedCourses.filter((c) => courseDoneSet.has(c.course_id)).length +
    (stageAssignments ?? []).filter((a) => assignmentDoneSet.has(a.assignment_id)).length;
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const allCoursesDone = sortedCourses.every((c) => courseDoneSet.has(c.course_id));

  return (
    <PageContainer
      title={`Giai đoạn ${stage.stage_order + 1}: ${stage.name}`}
      breadcrumbs={[
        { title: "Lộ trình của tôi", path: "/my-learning-paths" },
        ...(lp ? [{ title: lp.title }] : []),
        { title: stage.name },
      ]}
    >
      {prevStageLocked && (
        <Card className="mb-4 border-amber-300 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-2 text-sm text-amber-900">
            <Lock className="h-4 w-4" /> Cần hoàn thành các giai đoạn trước trong chế độ học tuần tự.
          </CardContent>
        </Card>
      )}

      <Card className="mb-4">
        <CardContent className="p-5">
          {stage.description && <p className="text-sm text-muted-foreground mb-3">{stage.description}</p>}
          <div className="flex justify-between text-sm mb-2">
            <span>Tiến độ giai đoạn</span>
            <span className="font-medium">{doneItems}/{totalItems} mục • {progress}%</span>
          </div>
          <Progress value={progress} />
          {sequential && (
            <p className="text-xs text-muted-foreground mt-2">
              <Lock className="inline h-3 w-3 mr-1" />
              Chế độ học tuần tự đang bật — phải hoàn thành lần lượt.
            </p>
          )}
        </CardContent>
      </Card>

      <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-2">
        <BookOpen className="h-4 w-4" /> Khoá học ({sortedCourses.length})
      </h3>
      <div className="space-y-3 mb-6">
        {loadingSC && <Skeleton className="h-24 w-full" />}
        {!loadingSC && sortedCourses.length === 0 && (
          <Card><CardContent className="p-4 text-sm text-muted-foreground">Chưa có khoá học.</CardContent></Card>
        )}
        {sortedCourses.map((sc, idx) => {
          const course = allCourses?.find((c) => c.id === sc.course_id);
          const done = courseDoneSet.has(sc.course_id);
          const prevDone = idx === 0 || courseDoneSet.has(sortedCourses[idx - 1].course_id);
          const locked = prevStageLocked || (sequential && !done && !prevDone);
          return (
            <Card key={sc.id} className={locked ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : locked ? <Lock className="h-4 w-4" /> : <PlayCircle className="h-4 w-4 text-primary" />}
                    {idx + 1}. {course?.title ?? "Khoá học"}
                  </span>
                  {done && <Badge variant="secondary">Hoàn thành</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center pt-0">
                <div className="text-xs text-muted-foreground">
                  {course?.code} • {course?.duration_minutes ?? 0} phút
                </div>
                <Button size="sm" disabled={locked} asChild={!locked}>
                  {locked ? <span>Đã khoá</span> : (
                    <Link to="/my-learning-paths/learning-screen/$courseId" params={{ courseId: sc.course_id }}>
                      {done ? "Xem lại" : "Bắt đầu"}
                    </Link>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-2">
        <FileQuestion className="h-4 w-4" /> Bài kiểm tra ({stageAssignments?.length ?? 0})
      </h3>
      <div className="space-y-3">
        {loadingSA && <Skeleton className="h-24 w-full" />}
        {!loadingSA && (stageAssignments?.length ?? 0) === 0 && (
          <Card><CardContent className="p-4 text-sm text-muted-foreground">Không có bài kiểm tra.</CardContent></Card>
        )}
        {(stageAssignments ?? []).map((sa) => {
          const a = allAssignments?.find((x) => x.id === sa.assignment_id);
          const done = assignmentDoneSet.has(sa.assignment_id);
          const gateOk = sa.unlock_condition === "always" || allCoursesDone;
          const locked = prevStageLocked || (!done && !gateOk);
          return (
            <Card key={sa.id} className={locked ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : locked ? <Lock className="h-4 w-4" /> : <FileQuestion className="h-4 w-4 text-primary" />}
                    {a?.title ?? "Bài kiểm tra"}
                  </span>
                  <div className="flex gap-2">
                    {sa.required && <Badge variant="outline">Bắt buộc</Badge>}
                    {done && <Badge variant="secondary">Đã nộp</Badge>}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center pt-0">
                <div className="text-xs text-muted-foreground">
                  {a?.code} • {a?.total_questions ?? 0} câu
                </div>
                <Button size="sm" disabled={locked} variant={done ? "outline" : "default"}>
                  {locked ? "Cần hoàn thành khoá học" : done ? "Xem kết quả" : "Làm bài"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
