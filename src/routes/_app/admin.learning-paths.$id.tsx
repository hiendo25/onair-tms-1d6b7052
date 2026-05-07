import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Users, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MOCK_LEARNING_PATHS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/learning-paths/$id")({
  loader: ({ params }) => {
    const path = MOCK_LEARNING_PATHS.find((p) => p.id === params.id);
    if (!path) throw notFound();
    return { path };
  },
  notFoundComponent: () => <PageContainer title="Không tìm thấy lộ trình"><Button asChild variant="outline"><Link to="/admin/learning-paths"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button></PageContainer>,
  component: LearningPathDetail,
});

function LearningPathDetail() {
  const { path } = Route.useLoaderData();
  const totalCourses = path.phases.reduce((s, p) => s + p.courses, 0);
  const totalWeeks = path.phases.reduce((s, p) => s + p.weeks, 0);

  return (
    <PageContainer
      title={path.title}
      breadcrumbs={[{ title: "Lộ trình học tập", path: "/admin/learning-paths" }, { title: path.title }]}
      actions={<Button size="sm"><Pencil className="h-4 w-4" />Chỉnh sửa lộ trình</Button>}
    >
      <Card className="overflow-hidden">
        <div className="bg-gradient-hero p-6 text-white">
          <Badge className="bg-white/20 text-white hover:bg-white/30">{path.status === "published" ? "Đã xuất bản" : "Bản nháp"}</Badge>
          <h2 className="mt-3 font-display text-3xl font-semibold">{path.title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80">{path.description}</p>
          <div className="mt-5 flex flex-wrap gap-6 text-sm">
            <span className="flex items-center gap-2"><Users className="h-4 w-4" />{path.enrolled} học viên</span>
            <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" />{totalCourses} khoá học</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{totalWeeks} tuần</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{path.phases.length} giai đoạn</span>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="font-display text-xl font-semibold">Các giai đoạn</h3>
        <p className="text-sm text-muted-foreground">Lộ trình được chia thành các giai đoạn nối tiếp.</p>
      </div>

      <div className="relative space-y-4 border-l-2 border-dashed border-border pl-8">
        {path.phases.map((p, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-10 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-vibrant text-xs font-semibold text-white shadow-elevated">
              {i + 1}
            </div>
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="text-lg">{p.title}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">Giai đoạn {i + 1} / {path.phases.length}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary"><BookOpen className="h-3 w-3" />{p.courses} khoá</Badge>
                  <Badge variant="outline"><Clock className="h-3 w-3" />{p.weeks} tuần</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: p.courses }).slice(0, 3).map((_, ci) => (
                    <div key={ci} className="flex items-center gap-3 rounded-md border bg-muted/30 p-2.5 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary"><BookOpen className="h-4 w-4" /></div>
                      <span className="flex-1">Khoá học #{ci + 1} của giai đoạn này</span>
                      <span className="text-xs text-muted-foreground">2-3h</span>
                    </div>
                  ))}
                  {p.courses > 3 && <p className="text-xs text-muted-foreground">+ {p.courses - 3} khoá học khác</p>}
                </div>
                <Progress value={[80, 45, 15, 0][i] ?? 0} className="mt-4 h-1.5" />
                <div className="mt-1 text-xs text-muted-foreground">Tiến độ trung bình: {[80, 45, 15, 0][i] ?? 0}%</div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
