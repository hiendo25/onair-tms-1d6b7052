import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, Lock, BookOpen } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MY_PATH = {
  title: "Lộ trình Onboarding nhân viên mới",
  progress: 42,
  phases: [
    { title: "Tuần đầu - Văn hoá & quy định", weeks: 1, status: "done" as const, courses: ["Văn hoá công ty", "Quy định lao động", "Hệ thống IT"] },
    { title: "Tháng 1 - Kỹ năng cốt lõi", weeks: 4, status: "doing" as const, courses: ["Giao tiếp chuyên nghiệp", "Quản lý thời gian", "Excel cơ bản", "Email & Slack", "Họp hiệu quả"] },
    { title: "Tháng 2 - Nghiệp vụ chuyên sâu", weeks: 4, status: "locked" as const, courses: ["Nghiệp vụ phòng ban", "Sản phẩm dịch vụ", "Quy trình bán hàng", "Chăm sóc khách hàng"] },
    { title: "Tháng 3 - Đánh giá & chứng nhận", weeks: 2, status: "locked" as const, courses: ["Bài thi tổng hợp", "Phỏng vấn đánh giá"] },
  ],
};

export const Route = createFileRoute("/_app/my-learning-paths")({
  head: () => ({ meta: [{ title: "Lộ trình của tôi — OnAir LMS" }] }),
  component: () => (
    <PageContainer
      title={MY_PATH.title}
      description="Lộ trình học tập cá nhân hoá dành cho bạn"
      breadcrumbs={[{ title: "Học tập" }, { title: "Lộ trình" }]}
    >
      <Card className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm font-medium">Tiến độ tổng</div>
            <Progress value={MY_PATH.progress} className="mt-2 h-2" />
          </div>
          <div className="text-3xl font-bold text-primary">{MY_PATH.progress}%</div>
        </div>
      </Card>

      <div className="space-y-4">
        {MY_PATH.phases.map((p, i) => {
          const Icon = p.status === "done" ? CheckCircle2 : p.status === "doing" ? Circle : Lock;
          const colors = p.status === "done"
            ? "bg-emerald-100 text-emerald-700"
            : p.status === "doing"
              ? "bg-blue-100 text-blue-700"
              : "bg-muted text-muted-foreground";
          return (
            <Card key={i} className={p.status === "locked" ? "opacity-60" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colors}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">Giai đoạn {i + 1}</Badge>
                        <span className="text-xs text-muted-foreground">{p.weeks} tuần</span>
                      </div>
                      <h3 className="mt-1 text-base font-semibold">{p.title}</h3>
                    </div>
                  </div>
                  {p.status === "doing" && <Button size="sm">Tiếp tục</Button>}
                  {p.status === "done" && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Hoàn thành</Badge>}
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {p.courses.map(c => (
                    <div key={c} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      {c}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  ),
});
