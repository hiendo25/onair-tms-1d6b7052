import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayCircle, Calendar, Users, GraduationCap } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useOrgData } from "@/lib/org-context";

const TABS = [
  { value: "all", label: "Tất cả", count: 9 },
  { value: "ongoing", label: "Đang diễn ra", count: 4 },
  { value: "today", label: "Hôm nay", count: 1 },
  { value: "upcoming", label: "Sắp diễn ra", count: 2 },
  { value: "past", label: "Đã kết thúc", count: 2 },
];

export const Route = createFileRoute("/_app/my-class")({
  head: () => ({ meta: [{ title: "Lớp học của tôi — OnAir TMS" }] }),
  component: () => {
    const data = useOrgData();
    const myClasses = data.classrooms.slice(0, 6);
    return (
      <PageContainer
        title="Lớp học của tôi"
        breadcrumbs={[{ title: "LMS", path: "/dashboard" }, { title: "Lớp học của tôi" }]}
      >
        <Tabs defaultValue="all">
          <TabsList>
            {TABS.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="gap-2">
                {t.label}
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{t.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="all">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myClasses.map(c => (
                <Card key={c.id} className="overflow-hidden p-2 transition-shadow hover:shadow-md">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg" style={{ background: c.cover }} />
                  <div className="space-y-3 px-1 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-600">Đang diễn ra</span>
                      <Badge variant="outline">Online</Badge>
                    </div>
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2 min-h-[42px]">{c.name}</h3>
                    <div className="space-y-1.5 border-t pt-3">
                      <div className="flex items-center gap-2 text-xs"><Calendar className="h-4 w-4" />{c.startDate} - {c.endDate}</div>
                      <div className="flex items-center gap-2 text-xs"><Users className="h-4 w-4" /><span className="font-semibold">{c.students}</span> Học viên</div>
                      <div className="flex items-center gap-2 text-xs"><GraduationCap className="h-4 w-4" />{c.teacher}</div>
                    </div>
                    <Button asChild size="sm" className="w-full">
                      <Link to="/class-room/$slug" params={{ slug: c.id }}><PlayCircle className="h-4 w-4" />Vào lớp học</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          {TABS.slice(1).map(t => (
            <TabsContent key={t.value} value={t.value}>
              <Card className="p-12 text-center text-sm text-muted-foreground">Không có lớp học nào trong trạng thái này.</Card>
            </TabsContent>
          ))}
        </Tabs>
      </PageContainer>
    );
  },
});
