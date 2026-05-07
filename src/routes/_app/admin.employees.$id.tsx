import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Briefcase, Calendar, Pencil, ArrowLeft, BookOpen, Award, Activity } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MOCK_EMPLOYEES, MOCK_CLASSROOMS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/employees/$id")({
  loader: ({ params }) => {
    const employee = MOCK_EMPLOYEES.find((e) => e.id === params.id);
    if (!employee) throw notFound();
    return { employee };
  },
  notFoundComponent: () => (
    <PageContainer title="Không tìm thấy người dùng">
      <p className="text-muted-foreground">Người dùng này không tồn tại.</p>
      <Button asChild variant="outline" className="mt-3"><Link to="/admin/employees"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button>
    </PageContainer>
  ),
  component: EmployeeDetail,
});

const ROLE_LABEL = { admin: "Quản trị", teacher: "Giảng viên", student: "Học viên" } as const;

function EmployeeDetail() {
  const { employee: e } = Route.useLoaderData();
  const initials = e.name.split(" ").slice(-2).map((n) => n[0]).join("");

  return (
    <PageContainer
      title={e.name}
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Người dùng", path: "/admin/employees" }, { title: e.name }]}
      actions={<Button size="sm"><Pencil className="h-4 w-4" />Chỉnh sửa</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardContent className="p-6 text-center">
            <Avatar className="mx-auto h-24 w-24">
              <AvatarFallback className="bg-gradient-vibrant text-xl text-white">{initials}</AvatarFallback>
            </Avatar>
            <h2 className="mt-4 font-display text-xl font-semibold">{e.name}</h2>
            <p className="text-sm text-muted-foreground">{e.position}</p>
            <Badge variant="secondary" className="mt-2">{ROLE_LABEL[e.role]}</Badge>
            <div className="mt-6 space-y-3 text-left text-sm">
              <Row icon={Mail} label={e.email} />
              <Row icon={Phone} label={e.phone} />
              <Row icon={MapPin} label={e.branch} />
              <Row icon={Briefcase} label={e.department} />
              <Row icon={Calendar} label={`Gia nhập: ${e.joinedAt}`} />
            </div>
            <div className={`mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${e.status === "active" ? "bg-success/15 text-success-foreground" : "bg-muted text-muted-foreground"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${e.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
              {e.status === "active" ? "Đang hoạt động" : "Ngưng hoạt động"}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={BookOpen} label="Khóa học" value="14" />
            <StatCard icon={Award} label="Chứng chỉ" value="6" />
            <StatCard icon={Activity} label="Tiến độ TB" value="78%" />
          </div>

          <Card>
            <Tabs defaultValue="classes" className="w-full">
              <CardHeader className="border-b">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="classes">Lớp học</TabsTrigger>
                  <TabsTrigger value="certs">Chứng chỉ</TabsTrigger>
                  <TabsTrigger value="activity">Hoạt động</TabsTrigger>
                </TabsList>
              </CardHeader>
              <TabsContent value="classes" className="p-0">
                <div className="divide-y">
                  {MOCK_CLASSROOMS.slice(0, 4).map((c) => (
                    <div key={c.id} className="flex items-center gap-4 p-4">
                      <div className="h-12 w-12 shrink-0 rounded-lg" style={{ background: c.cover }} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.code} · GV: {c.teacher}</div>
                        <Progress value={c.progress} className="mt-2 h-1.5" />
                      </div>
                      <div className="text-sm font-semibold tabular-nums">{c.progress}%</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="certs" className="p-6 text-sm text-muted-foreground">Chưa có chứng chỉ nào.</TabsContent>
              <TabsContent value="activity" className="p-6 text-sm text-muted-foreground">Chưa có hoạt động gần đây.</TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function Row({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-display text-2xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
