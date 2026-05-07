import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Star, Users, Clock, BookOpen } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_COURSES } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/online-course")({
  head: () => ({ meta: [{ title: "Môn học — OnAir LMS" }] }),
  component: CoursesPage,
});

function CoursesPage() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");

  const filtered = useMemo(() => MOCK_COURSES.filter(c =>
    (!search || c.title.toLowerCase().includes(search.toLowerCase())) &&
    (level === "all" || c.level === level)
  ), [search, level]);

  return (
    <PageContainer
      title="Danh sách môn học"
      breadcrumbs={[{ title: "Quản lý lớp học" }, { title: "Môn học" }]}
      actions={<Button size="sm"><Plus className="h-4 w-4" />Tạo môn học</Button>}
    >
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm môn học..." className="pl-9 bg-background" />
        </div>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-44 bg-background"><SelectValue placeholder="Cấp độ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả cấp độ</SelectItem>
            <SelectItem value="Cơ bản">Cơ bản</SelectItem>
            <SelectItem value="Trung cấp">Trung cấp</SelectItem>
            <SelectItem value="Nâng cao">Nâng cao</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((c) => (
          <Card key={c.id} className="overflow-hidden p-0 transition-shadow hover:shadow-md">
            <div className="relative h-32" style={{ background: c.cover }}>
              <Badge variant="secondary" className="absolute left-3 top-3 bg-white/85 text-xs backdrop-blur">{c.category}</Badge>
            </div>
            <CardContent className="space-y-3 p-4">
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-muted-foreground">{c.code}</div>
                <h3 className="font-semibold leading-snug line-clamp-2 min-h-[2.5em]">{c.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{c.lessons} bài</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.duration}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />{c.enrolled}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{c.rating}
                </span>
                <Badge variant="outline" className="text-[10px]">{c.level}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
