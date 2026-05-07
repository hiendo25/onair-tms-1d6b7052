import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Users, Calendar, Clock, GraduationCap, ArrowLeft, Pencil, Settings, BookOpen } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_CLASSROOMS, MOCK_EMPLOYEES, MOCK_COURSES } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/class-room/$id")({
  loader: ({ params }) => {
    const classroom = MOCK_CLASSROOMS.find((c) => c.id === params.id);
    if (!classroom) throw notFound();
    return { classroom };
  },
  notFoundComponent: () => (
    <PageContainer title="Không tìm thấy lớp học">
      <Button asChild variant="outline"><Link to="/admin/class-room"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button>
    </PageContainer>
  ),
  component: ClassroomDetail,
});

function ClassroomDetail() {
  const { classroom: c } = Route.useLoaderData();
  const students = MOCK_EMPLOYEES.filter((e) => e.role === "student").slice(0, 6);
  const courses = MOCK_COURSES.slice(0, 4);

  return (
    <PageContainer
      title={c.name}
      breadcrumbs={[{ title: "Quản lý đào tạo" }, { title: "Lớp học", path: "/admin/class-room" }, { title: c.name }]}
      actions={
        <>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/class-room/$id/students" params={{ id: c.id }}><Users className="h-4 w-4" />Học viên</Link>
          </Button>
          <Button variant="outline" size="sm"><Settings className="h-4 w-4" />Cài đặt</Button>
          <Button size="sm"><Pencil className="h-4 w-4" />Chỉnh sửa</Button>
        </>
      }
    >
      <Card className="overflow-hidden">
        <div className="h-40" style={{ background: c.cover }} />
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{c.code}</Badge>
                <Badge variant={c.status === "active" ? "default" : c.status === "completed" ? "outline" : "secondary"}>
                  {c.status === "active" ? "Đang diễn ra" : c.status === "completed" ? "Đã kết thúc" : "Nháp"}
                </Badge>
                <Badge variant="outline" className="capitalize">{c.type}</Badge>
              </div>
              <h2 className="mt-2 font-display text-2xl font-semibold">{c.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Giảng viên: {c.teacher}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Tiến độ chung</div>
              <div className="font-display text-3xl font-semibold text-primary">{c.progress}%</div>
              <Progress value={c.progress} className="mt-1 h-2 w-40" />
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <Stat icon={Users} label="Học viên" value={`${c.students}/${c.capacity}`} />
            <Stat icon={Calendar} label="Bắt đầu" value={c.startDate} />
            <Stat icon={Calendar} label="Kết thúc" value={c.endDate} />
            <Stat icon={Clock} label="Loại hình" value={c.type === "online" ? "Trực tuyến" : c.type === "offline" ? "Trực tiếp" : "Kết hợp"} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="courses">Khóa học ({courses.length})</TabsTrigger>
          <TabsTrigger value="students">Học viên ({c.students})</TabsTrigger>
          <TabsTrigger value="schedule">Lịch học</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Mô tả lớp học</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Lớp học cung cấp kiến thức nền tảng và bài tập thực hành. Học viên sẽ trải qua các khóa học, làm bài kiểm tra và nhận chứng chỉ khi hoàn thành.
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Mục tiêu</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Nắm vững kiến thức cốt lõi</li>
                <li>✓ Thực hành tình huống thực tế</li>
                <li>✓ Đạt chứng chỉ hoàn thành khóa</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="flex gap-4 p-4">
                <div className="h-16 w-16 shrink-0 rounded-lg" style={{ background: course.cover }} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{course.title}</div>
                  <div className="text-xs text-muted-foreground">{course.lessons} bài · {course.duration}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{course.level}</Badge>
                    <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <div className="divide-y">
              {students.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.code} · {s.department}</div>
                    </div>
                  </div>
                  <Progress value={Math.floor(Math.random() * 60) + 30} className="h-1.5 w-32" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card><CardContent className="p-8 text-center text-muted-foreground">Lịch học sẽ được hiển thị tại đây.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
