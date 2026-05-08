import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, UserPlus, Download, Search, MoreHorizontal, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useClassrooms } from "@/lib/data-hooks";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/class-room/$id/students")({
  notFoundComponent: () => (
    <PageContainer title="Không tìm thấy lớp">
      <Button asChild variant="outline"><Link to="/admin/class-room"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button>
    </PageContainer>
  ),
  component: ClassroomStudents,
});

type StudentRow = {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  department: string;
  employee_code: string;
  assigned_at: string;
  progress: number;
  passed_assignments: number;
  total_assignments: number;
};

function useClassroomStudents(classroomId: string) {
  return useQuery({
    queryKey: ["classroom-students", classroomId],
    enabled: !!classroomId,
    queryFn: async (): Promise<StudentRow[]> => {
      const [studentsRes, coursesRes, assignmentsRes] = await Promise.all([
        supabase.from("classroom_students").select("id, employee_id, assigned_at").eq("classroom_id", classroomId),
        supabase.from("classroom_courses").select("course_id").eq("classroom_id", classroomId),
        supabase.from("classroom_assignments").select("assignment_id").eq("classroom_id", classroomId),
      ]);

      const studentLinks = studentsRes.data ?? [];
      if (studentLinks.length === 0) return [];

      const employeeIds = studentLinks.map((s) => s.employee_id).filter((v): v is string => !!v);
      const courseIds = (coursesRes.data ?? []).map((c) => c.course_id);
      const assignmentIds = (assignmentsRes.data ?? []).map((a) => a.assignment_id);

      const [empsRes, progressRes, submissionsRes] = await Promise.all([
        supabase.from("employees").select("id, name, email, department, employee_code, user_id").in("id", employeeIds),
        courseIds.length > 0
          ? supabase.from("course_enrollments").select("user_id, course_id, progress, status").in("course_id", courseIds)
          : Promise.resolve({ data: [] }),
        assignmentIds.length > 0
          ? supabase.from("assignment_submissions").select("user_id, assignment_id, status, score").in("assignment_id", assignmentIds)
          : Promise.resolve({ data: [] }),
      ]);

      const emps = empsRes.data ?? [];
      const progRows = progressRes.data ?? [];
      const subRows = submissionsRes.data ?? [];

      return studentLinks.map((link) => {
        const emp = emps.find((e) => e.id === link.employee_id);
        if (!emp) return null;

        const userProgress = courseIds.length > 0
          ? progRows.filter((p) => p.user_id === emp.user_id && courseIds.includes(p.course_id))
          : [];
        const avgProgress = userProgress.length > 0
          ? Math.round(userProgress.reduce((sum, p) => sum + (p.progress ?? 0), 0) / userProgress.length)
          : 0;

        const userSubs = assignmentIds.length > 0
          ? subRows.filter((s) => s.user_id === emp.user_id && assignmentIds.includes(s.assignment_id))
          : [];
        const passed = userSubs.filter((s) => s.status === "passed" || s.status === "completed").length;

        return {
          id: link.id,
          employee_id: emp.id,
          name: emp.name ?? "",
          email: emp.email ?? "",
          department: emp.department ?? "—",
          employee_code: emp.employee_code ?? "",
          assigned_at: link.assigned_at,
          progress: avgProgress,
          passed_assignments: passed,
          total_assignments: assignmentIds.length,
        } satisfies StudentRow;
      }).filter(Boolean) as StudentRow[];
    },
  });
}

function ClassroomStudents() {
  const { id } = Route.useParams();
  const { data: classrooms = [], isLoading: loadingCR } = useClassrooms();
  const { data: students = [], isLoading: loadingStudents } = useClassroomStudents(id);
  const [q, setQ] = useState("");

  const cr = classrooms.find((c) => c.id === id);

  const filtered = students.filter((s) =>
    !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.email.toLowerCase().includes(q.toLowerCase()) || s.employee_code.toLowerCase().includes(q.toLowerCase()),
  );

  const total = students.length;
  const completed = students.filter((s) => s.progress === 100).length;
  const inProgress = students.filter((s) => s.progress > 0 && s.progress < 100).length;
  const notStarted = students.filter((s) => s.progress === 0).length;

  async function removeStudent(employeeId: string) {
    const { error } = await supabase.from("classroom_students").delete().eq("classroom_id", id).eq("employee_id", employeeId);
    if (error) { toast.error("Không thể loại học viên"); return; }
    toast.success("Đã loại học viên khỏi lớp");
  }

  if (loadingCR) {
    return (
      <PageContainer title="Học viên" breadcrumbs={[{ title: "Lớp học", path: "/admin/class-room" }, { title: "..." }]}>
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Học viên — ${cr?.title ?? id}`}
      breadcrumbs={[
        { title: "Lớp học", path: "/admin/class-room" },
        { title: cr?.title ?? id, path: `/admin/class-room/${id}` },
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
        <SummaryCard label="Tổng học viên" value={String(total)} />
        <SummaryCard label="Đã hoàn thành" value={String(completed)} accent="text-emerald-600" />
        <SummaryCard label="Đang học" value={String(inProgress)} accent="text-primary" />
        <SummaryCard label="Chưa bắt đầu" value={String(notStarted)} accent="text-muted-foreground" />
      </div>

      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm học viên..."
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        {loadingStudents ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            {total === 0 ? "Chưa có học viên nào trong lớp." : "Không tìm thấy học viên."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học viên</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Tiến độ khóa học</TableHead>
                <TableHead>Bài kiểm tra</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {s.name.split(" ").slice(-2).map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.employee_code}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={s.progress} className="h-1.5 w-24" />
                      <span className="text-xs tabular-nums w-9">{s.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {s.total_assignments > 0 ? `${s.passed_assignments}/${s.total_assignments}` : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.progress === 100 ? "default" : s.progress > 0 ? "secondary" : "outline"}>
                      {s.progress === 100 ? "Hoàn thành" : s.progress > 0 ? "Đang học" : "Chưa bắt đầu"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Xem tiến độ</DropdownMenuItem>
                        <DropdownMenuItem>Gửi nhắc nhở</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => removeStudent(s.employee_id)}
                        >
                          Loại khỏi lớp
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </PageContainer>
  );
}

function SummaryCard({ label, value, accent = "text-foreground" }: { label: string; value: string; accent?: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accent}`}>{value}</div>
    </Card>
  );
}
