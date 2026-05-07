import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayCircle, Calendar, Users, GraduationCap } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MOCK_CLASSROOMS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/my-class")({
  head: () => ({ meta: [{ title: "Lớp học của tôi — OnAir LMS" }] }),
  component: () => {
    const myClasses = MOCK_CLASSROOMS.slice(0, 6);
    return (
      <PageContainer
        title="Lớp học của tôi"
        breadcrumbs={[{ title: "Học tập" }, { title: "Lớp học" }]}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {myClasses.map(c => (
            <Card key={c.id} className="overflow-hidden p-0 transition-shadow hover:shadow-md">
              <div className="relative h-32" style={{ background: c.cover }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 text-white">
                  <h3 className="font-semibold leading-snug line-clamp-2">{c.name}</h3>
                </div>
              </div>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{c.teacher}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{c.students} HV</span>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Tiến độ</span>
                    <span className="font-medium">{c.progress}%</span>
                  </div>
                  <Progress value={c.progress} className="h-1.5" />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Đến {c.endDate}
                </div>
                <Button asChild className="w-full" size="sm">
                  <Link to="/dashboard"><PlayCircle className="h-4 w-4" />Tiếp tục học</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    );
  },
});
