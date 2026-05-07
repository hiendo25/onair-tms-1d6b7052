import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, Lock, BookOpen } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MY_PATH = {
  title: "Onboarding nhân viên mới - Highlands Coffee",
  progress: 42,
  phases: [
    { title: "Tuần 1 - Văn hoá thương hiệu & nội quy", weeks: 1, status: "done" as const, courses: ["Văn hoá Highlands Coffee", "Nội quy nhân viên cửa hàng", "Đồng phục & tác phong"] },
    { title: "Tuần 2 - Quy trình pha chế chuẩn", weeks: 1, status: "doing" as const, courses: ["Pha chế Phin truyền thống", "Pha chế Espresso & Latte", "Pha chế Trà & Freeze", "Định lượng nguyên liệu", "Vệ sinh máy pha"] },
    { title: "Tuần 3 - VSATTP & vận hành cửa hàng", weeks: 1, status: "locked" as const, courses: ["An toàn vệ sinh thực phẩm", "Vận hành máy POS", "Tiếp nhận order khách hàng"] },
    { title: "Tuần 4 - Thực tập & đánh giá", weeks: 1, status: "locked" as const, courses: ["Thực tập tại cửa hàng", "Bài thi nghiệp vụ pha chế"] },
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
