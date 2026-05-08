import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Clock, ListChecks, RefreshCw, Users, Copy } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuizItemAnalysisCard } from "@/components/ai/QuizItemAnalysisCard";
import {
  useAssignments, useAssignmentMutations, useExamQuestions, useQuestions,
} from "@/lib/data-hooks";
import { ASSIGNMENT_STATUS } from "@/lib/admin-options";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/assignments/$id/")({
  head: () => ({ meta: [{ title: "Chi tiết bài KT — OnAir TMS" }] }),
  notFoundComponent: () => <PageContainer title="Không tìm thấy"><Button asChild variant="outline"><Link to="/admin/assignments"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button></PageContainer>,
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { data: rows = [] } = useAssignments();
  const { data: links = [] } = useExamQuestions();
  const { data: bank = [] } = useQuestions();
  const am = useAssignmentMutations();
  const a = rows.find(r => r.id === id);
  if (!a) return null;
  const ax = a;
  const myLinks = links.filter(l => l.assignment_id === ax.id).sort((x, y) => x.sort_order - y.sort_order);

  async function clone() {
    await am.create.mutateAsync({
      title: `${ax.title} (Bản sao)`, code: `${ax.code}-CP-${Date.now().toString().slice(-4)}`,
      description: ax.description, type: ax.type, deadline: ax.deadline,
      total_questions: ax.total_questions, total_points: ax.total_points,
      pass_score: ax.pass_score, time_limit_minutes: ax.time_limit_minutes,
      max_attempts: ax.max_attempts, shuffle_questions: ax.shuffle_questions,
      shuffle_answers: ax.shuffle_answers, show_results: ax.show_results, status: "draft",
    });
    toast.success("Đã nhân bản");
  }

  return (
    <PageContainer
      title={ax.title}
      breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }, { title: ax.title }]}
      actions={<>
        <Button variant="outline" size="sm" onClick={clone}><Copy className="h-4 w-4" /> Nhân bản</Button>
        <Button variant="outline" size="sm" asChild><Link to="/admin/assignments/$id/assign" params={{ id: ax.id }}><Users className="h-4 w-4" />Gán học viên</Link></Button>
        <Button size="sm" asChild><Link to="/admin/assignments/$id/editor" params={{ id: ax.id }}><Pencil className="h-4 w-4" />Chỉnh sửa</Link></Button>
      </>}
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat icon={ListChecks} label="Số câu hỏi" value={String(ax.total_questions)} />
        <Stat icon={ListChecks} label="Tổng điểm" value={`${ax.total_points}/100`} />
        <Stat icon={Clock} label="Thời gian" value={ax.time_limit_minutes ? `${ax.time_limit_minutes} phút` : "—"} />
        <Stat icon={RefreshCw} label="Số lần làm" value={ax.max_attempts ? String(ax.max_attempts) : "Không giới hạn"} />
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Mã bài</div>
            <div className="font-medium">{ax.code}</div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{ax.type}</Badge>
            <Badge variant={ax.status === "published" ? "default" : "secondary"}>{ASSIGNMENT_STATUS.find(s => s.value === ax.status)?.label || ax.status}</Badge>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">{ax.description || "Không có mô tả"}</div>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <div>Điểm đạt: <strong>{ax.pass_score}%</strong></div>
          <div>Trộn câu hỏi: <strong>{ax.shuffle_questions ? "Có" : "Không"}</strong></div>
          <div>Hiển thị kết quả: <strong>{ax.show_results ? "Có" : "Không"}</strong></div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 text-sm font-semibold">Danh sách câu hỏi ({myLinks.length})</div>
        <div className="space-y-2">
          {myLinks.length === 0 && <div className="text-sm text-muted-foreground">Chưa có câu hỏi nào.</div>}
          {myLinks.map((l, i) => {
            const q = bank.find(b => b.id === l.question_id);
            return (
              <div key={l.id} className="flex items-start gap-3 rounded border p-3">
                <span className="text-xs font-semibold text-primary">#{i + 1}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{q?.title || q?.question || "(Câu hỏi đã xoá)"}</div>
                  <div className="mt-1 flex gap-2"><Badge variant="outline" className="text-xs">{q?.type}</Badge><Badge variant="secondary" className="text-xs">{l.points}đ</Badge></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <QuizItemAnalysisCard assignmentId={ax.id} />
    </PageContainer>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card><CardContent className="flex items-center gap-3 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
      <div><div className="text-xs text-muted-foreground">{label}</div><div className="font-display text-xl font-semibold">{value}</div></div>
    </CardContent></Card>
  );
}
