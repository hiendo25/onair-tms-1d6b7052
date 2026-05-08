import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Play, CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";

export const Route = createFileRoute("/_app/my-courses/")({
  head: () => ({ meta: [{ title: "Khóa học của tôi — OnAir TMS" }] }),
  component: MyCourses,
});

function MyCourses() {
  const { orgId } = useOrg();
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null)); }, []);

  const courses = useQuery({
    queryKey: ["my-courses", orgId, userId],
    enabled: !!userId,
    queryFn: async () => {
      const [{ data: courseRows }, { data: enrollRows }] = await Promise.all([
        supabase.from("online_courses").select("*").eq("org_id", orgId).eq("status", "published").order("created_at", { ascending: false }),
        supabase.from("course_enrollments").select("*").eq("user_id", userId!),
      ]);
      const enrollMap = new Map((enrollRows ?? []).map((e) => [e.course_id, e]));
      return (courseRows ?? []).map((c) => ({ ...c, enrollment: enrollMap.get(c.id) }));
    },
  });

  const data = courses.data ?? [];

  return (
    <PageContainer title="Khóa học của tôi" breadcrumbs={[{ title: "Học viên" }, { title: "Khóa học" }]}>
      {courses.isLoading && <div className="text-muted-foreground">Đang tải...</div>}
      {!courses.isLoading && data.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">Chưa có khóa học nào.</Card>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((c) => {
          const e = c.enrollment;
          const progress = e?.progress ?? 0;
          const status = e?.status ?? "not_started";
          return (
            <Card key={c.id} className="overflow-hidden flex flex-col">
              <div className="aspect-video bg-muted overflow-hidden">
                {c.cover_url ? (
                  <img src={c.cover_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <BookOpen className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold line-clamp-2">{c.title}</h3>
                  {status === "completed" && <Badge className="bg-emerald-100 text-emerald-700 shrink-0"><CheckCircle2 className="h-3 w-3 mr-1" />Hoàn thành</Badge>}
                  {status === "in_progress" && <Badge className="bg-blue-100 text-blue-700 shrink-0">Đang học</Badge>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{c.description || "Không có mô tả"}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {c.duration_minutes > 0 && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.duration_minutes} phút</span>}
                  <span>{c.lessons_count} bài học</span>
                </div>
                {e && (
                  <div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">Tiến độ: {progress}%</div>
                  </div>
                )}
                <Button asChild className="w-full">
                  <Link to="/my-courses/$id" params={{ id: c.id }}>
                    <Play className="h-4 w-4 mr-1" />
                    {status === "not_started" ? "Bắt đầu học" : status === "completed" ? "Xem lại" : "Tiếp tục"}
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
