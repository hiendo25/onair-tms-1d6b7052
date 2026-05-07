import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, UserPlus, Download, Search, MoreHorizontal } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MOCK_CLASSROOMS, MOCK_EMPLOYEES } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/class-room/$id/students")({
  loader: ({ params }) => {
    const classroom = MOCK_CLASSROOMS.find((c) => c.id === params.id);
    if (!classroom) throw notFound();
    return { classroom };
  },
  notFoundComponent: () => <PageContainer title="Không tìm thấy lớp"><Button asChild variant="outline"><Link to="/admin/class-room"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button></PageContainer>,
  component: ClassroomStudents,
});

function ClassroomStudents() {
  const { classroom: c } = Route.useLoaderData();
  const students = MOCK_EMPLOYEES.filter((e) => e.role === "student" || e.role === "teacher").slice(0, c.students > 8 ? 8 : c.students);

  return (
    <PageContainer
      title={`Học viên - ${c.name}`}
      breadcrumbs={[
        { title: "Lớp học", path: "/admin/class-room" },
        { title: c.name, path: `/admin/class-room/${c.id}` },
        { title: "Học viên" },
      ]}
      actions={
        <>
          <Button variant="outline" size="sm"><Download className="h-4 w-4" />Xuất danh sách</Button>
          <Button size="sm"><UserPlus className="h-4 w-4" />Thêm học viên</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryCard label="Tổng học viên" value={String(c.students)} />
        <SummaryCard label="Đã hoàn thành" value={String(Math.floor(c.students * 0.4))} accent="text-success" />
        <SummaryCard label="Đang học" value={String(Math.floor(c.students * 0.5))} accent="text-primary" />
        <SummaryCard label="Chưa bắt đầu" value={String(Math.floor(c.students * 0.1))} accent="text-muted-foreground" />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Tìm học viên..." className="pl-9" />
          </div>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Học viên</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead>Tiến độ</TableHead>
              <TableHead>Bài kiểm tra</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s, i) => {
              const progress = [92, 78, 65, 45, 100, 30, 88, 12][i] ?? 50;
              const passed = [3, 2, 2, 1, 4, 0, 3, 0][i] ?? 1;
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{s.name.split(" ").slice(-2).map(n => n[0]).join("")}</AvatarFallback></Avatar>
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.code}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="h-1.5 w-24" />
                      <span className="text-xs tabular-nums w-9">{progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-sm">{passed}/4</span></TableCell>
                  <TableCell>
                    <Badge variant={progress === 100 ? "default" : progress > 0 ? "secondary" : "outline"}>
                      {progress === 100 ? "Hoàn thành" : progress > 0 ? "Đang học" : "Chưa bắt đầu"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Xem tiến độ</DropdownMenuItem>
                        <DropdownMenuItem>Gửi nhắc nhở</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Loại khỏi lớp</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}

function SummaryCard({ label, value, accent = "text-foreground" }: { label: string; value: string; accent?: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl font-semibold ${accent}`}>{value}</div>
    </Card>
  );
}
