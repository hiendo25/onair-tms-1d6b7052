import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, Users, Calendar, GraduationCap, MoreVertical } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_CLASSROOMS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/class-room")({
  head: () => ({ meta: [{ title: "Quản lý lớp học — OnAir LMS" }] }),
  component: ClassRoomPage,
});

const TYPE_LABEL = { online: "Online", offline: "Offline", hybrid: "Hybrid" } as const;
const STATUS_LABEL = { active: "Đang diễn ra", draft: "Nháp", completed: "Đã hoàn thành" } as const;

function ClassRoomPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    return MOCK_CLASSROOMS.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (tab !== "all" && c.status !== tab) return false;
      return true;
    });
  }, [search, tab]);

  return (
    <PageContainer
      title="Danh sách lớp học"
      breadcrumbs={[{ title: "Quản lý lớp học" }, { title: "Danh sách" }]}
      actions={
        <Button asChild size="sm">
          <Link to="/admin/class-room/create"><Plus className="h-4 w-4" />Tạo lớp học</Link>
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm lớp học..." className="pl-9 bg-background" />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="active">Đang diễn ra</TabsTrigger>
            <TabsTrigger value="draft">Nháp</TabsTrigger>
            <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Card key={c.id} className="overflow-hidden p-0 transition-shadow hover:shadow-md">
            <div className="relative h-32" style={{ background: c.cover }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute left-3 top-3 flex gap-1.5">
                <Badge variant="secondary" className="backdrop-blur bg-white/80 text-xs">{TYPE_LABEL[c.type]}</Badge>
                <Badge
                  className={`backdrop-blur text-xs ${
                    c.status === "active" ? "bg-emerald-500/90 hover:bg-emerald-500/90 text-white" :
                    c.status === "draft" ? "bg-amber-500/90 hover:bg-amber-500/90 text-white" :
                    "bg-slate-500/90 hover:bg-slate-500/90 text-white"
                  }`}
                >
                  {STATUS_LABEL[c.status]}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7 text-white hover:bg-white/20">
                <MoreVertical className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-3 right-3 text-white">
                <div className="text-xs opacity-90 font-mono">{c.code}</div>
              </div>
            </div>
            <CardContent className="space-y-3 p-4">
              <h3 className="font-semibold leading-snug line-clamp-2 min-h-[2.5em]">{c.name}</h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{c.students}/{c.capacity}</span>
                <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{c.teacher}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {c.startDate} → {c.endDate}
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Tiến độ</span>
                  <span className="font-medium">{c.progress}%</span>
                </div>
                <Progress value={c.progress} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
