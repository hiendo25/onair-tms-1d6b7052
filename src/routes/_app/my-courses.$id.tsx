import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Circle, Play, FileText, Video as VideoIcon, ListChecks, FileArchive, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/my-courses/$id")({
  head: () => ({ meta: [{ title: "Học khóa học — OnAir TMS" }] }),
  component: MyCourseLearn,
});

const ICONS = { video: VideoIcon, pdf: FileText, scorm: FileArchive, quiz: ListChecks } as const;

function MyCourseLearn() {
  const { id: courseId } = Route.useParams();
  const navigate = useNavigate();
  const { orgId } = useOrg();
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null)); }, []);

  const data = useQuery({
    queryKey: ["my-course-detail", courseId, userId],
    enabled: !!userId,
    queryFn: async () => {
      const [c, secs, less, prog, enr] = await Promise.all([
        supabase.from("online_courses").select("*").eq("id", courseId).maybeSingle(),
        supabase.from("course_sections").select("*").eq("course_id", courseId).order("sort_order"),
        supabase.from("course_lessons").select("*").eq("course_id", courseId).order("sort_order"),
        supabase.from("course_lesson_progress").select("*").eq("course_id", courseId).eq("user_id", userId!),
        supabase.from("course_enrollments").select("*").eq("course_id", courseId).eq("user_id", userId!).maybeSingle(),
      ]);
      return {
        course: c.data, sections: secs.data ?? [], lessons: less.data ?? [],
        progress: prog.data ?? [], enrollment: enr.data,
      };
    },
  });

  // Auto-create enrollment on first visit
  useEffect(() => {
    if (!data.data || !userId || data.data.enrollment) return;
    supabase.from("course_enrollments").insert({
      org_id: orgId, course_id: courseId, user_id: userId,
      status: "in_progress", started_at: new Date().toISOString(), progress: 0,
    }).then(() => qc.invalidateQueries({ queryKey: ["my-course-detail", courseId] }));
  }, [data.data, userId, orgId, courseId, qc]);

  const lessons = data.data?.lessons ?? [];
  const sections = data.data?.sections ?? [];
  const progressMap = useMemo(() => {
    const m = new Map<string, { status: string; progress_pct: number }>();
    (data.data?.progress ?? []).forEach((p) => m.set(p.lesson_id, { status: p.status, progress_pct: p.progress_pct }));
    return m;
  }, [data.data?.progress]);

  const activeLesson = useMemo(() => {
    if (activeLessonId) return lessons.find((l) => l.id === activeLessonId) ?? lessons[0];
    return lessons[0];
  }, [activeLessonId, lessons]);

  const lessonIdx = activeLesson ? lessons.findIndex((l) => l.id === activeLesson.id) : -1;
  const overallProgress = lessons.length === 0 ? 0 : Math.round((Array.from(progressMap.values()).filter((p) => p.status === "completed").length / lessons.length) * 100);

  const updateProgress = async (lessonId: string, patch: { status?: string; progress_pct?: number; meta?: Record<string, unknown> }) => {
    if (!userId) return;
    const existing = data.data?.progress.find((p) => p.lesson_id === lessonId);
    const payload = {
      org_id: orgId, course_id: courseId, lesson_id: lessonId, user_id: userId,
      status: patch.status ?? existing?.status ?? "in_progress",
      progress_pct: patch.progress_pct ?? existing?.progress_pct ?? 0,
      meta: (patch.meta ?? existing?.meta ?? {}) as never,
      started_at: existing?.started_at ?? new Date().toISOString(),
      completed_at: patch.status === "completed" ? new Date().toISOString() : existing?.completed_at ?? null,
    };
    if (existing) {
      await supabase.from("course_lesson_progress").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("course_lesson_progress").insert(payload);
    }
    // Recompute course progress
    const completed = (data.data?.progress ?? []).filter((p) => p.status === "completed").length + (patch.status === "completed" && existing?.status !== "completed" ? 1 : 0);
    const newProg = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
    await supabase.from("course_enrollments").update({
      progress: newProg,
      status: newProg >= 100 ? "completed" : "in_progress",
      completed_at: newProg >= 100 ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq("course_id", courseId).eq("user_id", userId);
    qc.invalidateQueries({ queryKey: ["my-course-detail", courseId] });
  };

  const markComplete = async (lessonId: string) => {
    await updateProgress(lessonId, { status: "completed", progress_pct: 100 });
    toast.success("Đã hoàn thành bài học");
  };

  const goLesson = (idx: number) => {
    if (idx < 0 || idx >= lessons.length) return;
    setActiveLessonId(lessons[idx].id);
  };

  if (data.isLoading) return <PageContainer title="Đang tải..."><div /></PageContainer>;
  if (!data.data?.course) return <PageContainer title="Không tìm thấy"><div /></PageContainer>;

  const c = data.data.course;

  return (
    <PageContainer
      title={c.title}
      breadcrumbs={[{ title: "Khóa học của tôi", path: "/my-courses" }, { title: c.title }]}
      actions={<Button variant="outline" size="sm" onClick={() => navigate({ to: "/my-courses" })}><ArrowLeft className="h-4 w-4 mr-1" />Quay lại</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {activeLesson ? (
            <Card className="overflow-hidden">
              <LessonViewer
                lesson={activeLesson}
                progress={progressMap.get(activeLesson.id)}
                onProgress={(patch) => updateProgress(activeLesson.id, patch)}
              />
              <div className="p-4 border-t space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{activeLesson.title}</h2>
                    {activeLesson.description && <p className="text-sm text-muted-foreground mt-1">{activeLesson.description}</p>}
                  </div>
                  {progressMap.get(activeLesson.id)?.status === "completed" && (
                    <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-3 w-3 mr-1" />Hoàn thành</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Button variant="outline" size="sm" onClick={() => goLesson(lessonIdx - 1)} disabled={lessonIdx <= 0}>
                    <ChevronLeft className="h-4 w-4 mr-1" />Bài trước
                  </Button>
                  {progressMap.get(activeLesson.id)?.status !== "completed" && (
                    <Button size="sm" onClick={() => markComplete(activeLesson.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />Đánh dấu hoàn thành
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => goLesson(lessonIdx + 1)} disabled={lessonIdx >= lessons.length - 1}>
                    Bài tiếp <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">Khóa học chưa có bài học.</Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tiến độ khóa học</span>
              <span className="text-sm text-muted-foreground">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </Card>

          <Card className="overflow-hidden">
            <div className="p-3 border-b font-medium">Nội dung khóa học</div>
            <div className="max-h-[600px] overflow-y-auto">
              {sections.map((sec, sIdx) => (
                <div key={sec.id} className="border-b last:border-0">
                  <div className="px-3 py-2 bg-muted/30 text-sm font-medium">
                    {sIdx + 1}. {sec.title}
                  </div>
                  {lessons.filter((l) => l.section_id === sec.id).map((les) => {
                    const p = progressMap.get(les.id);
                    const Icon = ICONS[les.lesson_type as keyof typeof ICONS] ?? FileText;
                    const active = activeLesson?.id === les.id;
                    return (
                      <button
                        key={les.id}
                        onClick={() => setActiveLessonId(les.id)}
                        className={`w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-muted/50 transition ${active ? "bg-primary/10" : ""}`}
                      >
                        {p?.status === "completed" ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className={`flex-1 text-sm truncate ${active ? "font-medium" : ""}`}>{les.title}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

interface LessonViewerProps {
  lesson: { id: string; lesson_type: string; content_url: string; content_meta: unknown; quiz_assignment_id: string | null; duration_seconds: number };
  progress?: { status: string; progress_pct: number };
  onProgress: (patch: { status?: string; progress_pct?: number; meta?: Record<string, unknown> }) => void;
}

function LessonViewer({ lesson, onProgress, progress }: LessonViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastReportRef = useRef<number>(0);
  const completedRef = useRef(progress?.status === "completed");
  completedRef.current = progress?.status === "completed";

  if (lesson.lesson_type === "video") {
    return (
      <video
        ref={videoRef}
        src={lesson.content_url}
        controls
        className="w-full aspect-video bg-black"
        onPlay={() => onProgress({ status: "in_progress" })}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (!v.duration) return;
          const pct = Math.round((v.currentTime / v.duration) * 100);
          if (Math.abs(pct - lastReportRef.current) >= 5) {
            lastReportRef.current = pct;
            onProgress({ progress_pct: pct, status: pct >= 80 ? "completed" : "in_progress" });
          }
        }}
      />
    );
  }
  if (lesson.lesson_type === "pdf") {
    return (
      <div>
        <iframe
          src={lesson.content_url}
          className="w-full h-[600px]"
          title="PDF"
          onLoad={() => onProgress({ status: "in_progress", progress_pct: 50 })}
        />
      </div>
    );
  }
  if (lesson.lesson_type === "scorm") {
    return (
      <div className="aspect-video bg-muted flex flex-col items-center justify-center p-8 text-center gap-3">
        <FileArchive className="h-12 w-12 text-muted-foreground" />
        <div>
          <div className="font-medium">SCORM Package</div>
          <div className="text-sm text-muted-foreground mt-1">Tải xuống và mở trong SCORM player</div>
        </div>
        <Button asChild>
          <a href={lesson.content_url} target="_blank" rel="noreferrer" onClick={() => onProgress({ status: "in_progress" })}>
            <Play className="h-4 w-4 mr-1" />Mở SCORM
          </a>
        </Button>
      </div>
    );
  }
  if (lesson.lesson_type === "quiz") {
    return (
      <div className="aspect-video bg-muted flex flex-col items-center justify-center p-8 text-center gap-3">
        <ListChecks className="h-12 w-12 text-muted-foreground" />
        <div>
          <div className="font-medium">Bài kiểm tra</div>
          <div className="text-sm text-muted-foreground mt-1">Mã: {lesson.quiz_assignment_id}</div>
        </div>
        <Button onClick={() => onProgress({ status: "in_progress" })}>
          <Play className="h-4 w-4 mr-1" />Bắt đầu làm bài
        </Button>
      </div>
    );
  }
  return <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground">Không có nội dung</div>;
}
