import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, BookOpen, Users, Calendar, MoreHorizontal } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_LEARNING_PATHS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/learning-paths")({
  head: () => ({ meta: [{ title: "Lộ trình học tập — OnAir LMS" }] }),
  component: LearningPathsPage,
});

function LearningPathsPage() {
  return (
    <PageContainer
      title="Lộ trình học tập"
      breadcrumbs={[{ title: "Lộ trình học tập" }]}
      actions={
        <Button asChild size="sm">
          <Link to="/admin/learning-paths/create"><Plus className="h-4 w-4" />Tạo lộ trình</Link>
        </Button>
      }
    >
      <div className="space-y-5">
        {MOCK_LEARNING_PATHS.map((lp) => (
          <Card key={lp.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{lp.title}</CardTitle>
                  <Badge variant={lp.status === "published" ? "default" : "outline"}>
                    {lp.status === "published" ? "Đã xuất bản" : "Nháp"}
                  </Badge>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{lp.description}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{lp.enrolled} học viên</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{lp.phases.length} giai đoạn</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{lp.phases.reduce((s, p) => s + p.weeks, 0)} tuần</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-px bg-border md:left-1/2" />
                <div className="space-y-4">
                  {lp.phases.map((p, i) => (
                    <div key={i} className={`relative flex flex-col gap-3 md:flex-row ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground md:absolute md:left-1/2 md:-translate-x-1/2">
                        {i + 1}
                      </div>
                      <div className={`ml-12 flex-1 rounded-md border bg-card p-3 md:ml-0 md:max-w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:mr-auto md:pr-4" : "md:ml-auto md:pl-4"}`}>
                        <div className="font-medium text-sm">{p.title}</div>
                        <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                          <span>{p.courses} môn học</span>
                          <span>·</span>
                          <span>{p.weeks} tuần</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
