import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Clock, ListChecks, RefreshCw, Users, FileCheck2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrgData } from "@/lib/org-context";

export const Route = createFileRoute("/_app/admin/assignments/$id")({
  loader: ({ params }) => {
    const a = data.assignments.find((x) => x.id === params.id);
    if (!a) throw notFound();
    return { assignment: a };
  },
  notFoundComponent: () => <PageContainer title="Không tìm thấy bài kiểm tra"><Button asChild variant="outline"><Link to="/admin/assignments"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button></PageContainer>,
  component: AssignmentDetail,
});

function AssignmentDetail() {
  const data = useOrgData();
  const { assignment: a } = Route.useLoaderData();
  const submissions = data.employees.filter((e) => e.role === "student").slice(0, 6);

  return (
    <PageContainer
      title={a.title}
      breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }, { title: a.title }]}
      actions={
        <>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/assignments/$id/grade" params={{ id: a.id }}><FileCheck2 className="h-4 w-4" />Chấm bài</Link>
          </Button>
          <Button size="sm"><Pencil className="h-4 w-4" />Chỉnh sửa</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <InfoCard icon={ListChecks} label="Số câu hỏi" value={String(a.questions)} />
        <InfoCard icon={Clock} label="Thời gian" value={`${a.duration} phút`} />
        <InfoCard icon={RefreshCw} label="Số lần làm" value={String(a.attempts)} />
        <InfoCard icon={Users} label="Đã nộp" value={`${submissions.length} học viên`} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Thông tin bài kiểm tra</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{a.type}</Badge>
              <Badge variant={a.status === "published" ? "default" : "secondary"}>{a.status === "published" ? "Đã xuất bản" : "Bản nháp"}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Bài kiểm tra dùng để đánh giá kiến thức học viên. Học viên có {a.attempts} lần làm trong tối đa {a.duration} phút mỗi lần.
        </CardContent>
      </Card>

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Câu hỏi ({a.questions})</TabsTrigger>
          <TabsTrigger value="submissions">Bài nộp ({submissions.length})</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <Card>
            <div className="divide-y">
              {data.questions.slice(0, 5).map((q, i) => (
                <div key={q.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                    <div className="flex-1">
                      <div className="font-medium">{q.content}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">{q.type === "single" ? "Một đáp án" : q.type === "multiple" ? "Nhiều đáp án" : "Tự luận"}</Badge>
                        <Badge variant="secondary" className="text-xs">{q.category}</Badge>
                        <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Thời gian nộp</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((s, i) => {
                  const score = [85, 92, 70, 0, 78, 65][i];
                  const submitted = score > 0;
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{s.name.split(" ").slice(-2).map(n => n[0]).join("")}</AvatarFallback></Avatar>
                          <div className="font-medium">{s.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{submitted ? `2026-04-2${i} 14:${20 + i}` : "—"}</TableCell>
                      <TableCell><span className={`font-semibold ${score >= 80 ? "text-success" : score >= 50 ? "text-warning" : "text-muted-foreground"}`}>{submitted ? `${score}/100` : "—"}</span></TableCell>
                      <TableCell><Badge variant={submitted ? "default" : "outline"}>{submitted ? "Đã chấm" : "Chưa nộp"}</Badge></TableCell>
                      <TableCell>{submitted && <Button variant="link" size="sm" asChild><Link to="/admin/assignments/$id/grade" params={{ id: a.id }}>Xem</Link></Button>}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="analytics"><Card><CardContent className="p-8 text-center text-muted-foreground">Biểu đồ phân tích kết quả.</CardContent></Card></TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-display text-xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
