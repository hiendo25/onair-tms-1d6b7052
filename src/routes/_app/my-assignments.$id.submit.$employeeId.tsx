import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const Route = createFileRoute("/_app/my-assignments/$id/submit/$employeeId")({
  head: () => ({ meta: [{ title: "Làm bài kiểm tra — OnAir LMS" }] }),
  component: SubmitPage,
});

const QUESTIONS = [
  { q: "Đâu là định nghĩa đúng về A?", options: ["Đáp án 1", "Đáp án 2", "Đáp án 3", "Đáp án 4"] },
  { q: "Đâu là định nghĩa đúng về B?", options: ["Đáp án 1", "Đáp án 2", "Đáp án 3", "Đáp án 4"] },
  { q: "Trình bày quan điểm của bạn về vấn đề C.", options: null },
];

function SubmitPage() {
  const { id } = Route.useParams();
  return (
    <PageContainer
      title="Làm bài kiểm tra"
      breadcrumbs={[{ title: "Bài kiểm tra của tôi", path: "/my-assignments" }, { title: "Làm bài" }]}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {QUESTIONS.map((q, i) => (
            <Card key={i} className="p-6">
              <Label className="text-base font-medium">Câu {i + 1}. {q.q}</Label>
              {q.options ? (
                <RadioGroup className="mt-3 space-y-2">
                  {q.options.map(opt => (
                    <label key={opt} className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-muted">
                      <RadioGroupItem value={opt} id={`${i}-${opt}`} />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </RadioGroup>
              ) : (
                <Textarea rows={5} className="mt-3" placeholder="Nhập câu trả lời..." />
              )}
            </Card>
          ))}
          <div className="flex justify-between">
            <Button asChild variant="outline"><Link to="/my-assignments">Huỷ</Link></Button>
            <Button asChild><Link to="/my-assignments/$id/result/$employeeId" params={{ id, employeeId: Route.useParams().employeeId }}>Nộp bài</Link></Button>
          </div>
        </div>
        <Card className="h-fit p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4" /> Thời gian còn lại
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums">00:42:18</div>
          <div className="mt-4 text-xs font-semibold text-muted-foreground">Bản đồ câu hỏi</div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {QUESTIONS.map((_, i) => (
              <button key={i} className="aspect-square rounded-md border bg-background text-sm hover:bg-muted">{i + 1}</button>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
