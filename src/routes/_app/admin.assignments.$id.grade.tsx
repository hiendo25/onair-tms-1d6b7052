import { useState } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Save, CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_ASSIGNMENTS, MOCK_EMPLOYEES, MOCK_QUESTIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/assignments/$id/grade")({
  loader: ({ params }) => {
    const a = MOCK_ASSIGNMENTS.find((x) => x.id === params.id);
    if (!a) throw notFound();
    return { assignment: a };
  },
  notFoundComponent: () => <PageContainer title="Không tìm thấy bài"><Button asChild variant="outline"><Link to="/admin/assignments"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button></PageContainer>,
  component: GradeAssignment,
});

function GradeAssignment() {
  const { assignment: a } = Route.useLoaderData();
  const students = MOCK_EMPLOYEES.filter((e) => e.role === "student").slice(0, 6);
  const [activeIdx, setActiveIdx] = useState(0);
  const student = students[activeIdx];
  const questions = MOCK_QUESTIONS.slice(0, 4);

  return (
    <PageContainer
      title="Chấm bài kiểm tra"
      breadcrumbs={[
        { title: "Bài kiểm tra", path: "/admin/assignments" },
        { title: a.title, path: `/admin/assignments/${a.id}` },
        { title: "Chấm bài" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardHeader><CardTitle className="text-sm font-medium">Học viên ({students.length})</CardTitle></CardHeader>
          <CardContent className="p-2">
            <div className="space-y-1">
              {students.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActiveIdx(i)}
                  className={`flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors ${i === activeIdx ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                >
                  <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{s.name.split(" ").slice(-2).map(n => n[0]).join("")}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.code}</div>
                  </div>
                  {i < 3 && <CheckCircle2 className="h-4 w-4 text-success" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10"><AvatarFallback>{student.name.split(" ").slice(-2).map(n => n[0]).join("")}</AvatarFallback></Avatar>
                <div>
                  <div className="font-semibold">{student.name}</div>
                  <div className="text-xs text-muted-foreground">{student.code} · Nộp lúc 14:32 ngày 25/04/2026</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" disabled={activeIdx === 0} onClick={() => setActiveIdx((i) => i - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-sm text-muted-foreground">{activeIdx + 1} / {students.length}</span>
                <Button variant="outline" size="icon" disabled={activeIdx === students.length - 1} onClick={() => setActiveIdx((i) => i + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>

          {questions.map((q, i) => (
            <Card key={q.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                    <div>
                      <CardTitle className="text-base">{q.content}</CardTitle>
                      <div className="mt-1 flex gap-2"><Badge variant="outline" className="text-xs">{q.category}</Badge><Badge variant="secondary" className="text-xs">{q.difficulty}</Badge></div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  <div className="mb-1 text-xs font-medium text-muted-foreground">Câu trả lời của học viên</div>
                  {q.type === "essay"
                    ? "Nội dung trả lời tự luận của học viên sẽ hiển thị tại đây. Học viên đã trình bày các bước theo yêu cầu của câu hỏi."
                    : "Đáp án A, C"}
                </div>
                <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                  <div className="space-y-1.5">
                    <Label>Điểm câu này</Label>
                    <Input type="number" defaultValue={[8, 7, 9, 6][i]} max={10} className="w-full" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nhận xét</Label>
                    <Textarea placeholder="Phản hồi cho học viên..." rows={2} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="text-xs text-muted-foreground">Tổng điểm</div>
                <div className="font-display text-2xl font-semibold">75 / 100</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Lưu nháp</Button>
                <Button><Save className="h-4 w-4" />Hoàn tất chấm</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
