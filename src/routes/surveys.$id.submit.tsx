import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";

const QUESTIONS = [
  { q: "Bạn đánh giá chất lượng khoá học như thế nào?", options: ["Rất tốt", "Tốt", "Trung bình", "Kém"] },
  { q: "Giảng viên truyền đạt rõ ràng?", options: ["Hoàn toàn đồng ý", "Đồng ý", "Bình thường", "Không đồng ý"] },
  { q: "Bạn có đề xuất gì để cải thiện khoá học?", options: null },
];

export const Route = createFileRoute("/surveys/$id/submit")({
  head: () => ({ meta: [{ title: "Khảo sát — OnAir TMS" }] }),
  component: SubmitPage,
});

function SubmitPage() {
  const { id } = Route.useParams();
  return (
    <div className="min-h-screen bg-muted/40 py-10">
      <div className="mx-auto max-w-2xl space-y-4 px-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Khảo sát #{id}</h1>
              <p className="text-sm text-muted-foreground">Phản hồi của bạn giúp chúng tôi cải thiện chất lượng đào tạo.</p>
            </div>
          </div>
          <Progress value={33} className="mt-4 h-1.5" />
          <div className="mt-1 text-xs text-muted-foreground">1 / {QUESTIONS.length} câu</div>
        </Card>
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
              <Textarea rows={4} className="mt-3" placeholder="Nhập câu trả lời..." />
            )}
          </Card>
        ))}
        <div className="flex justify-between">
          <Button asChild variant="outline"><Link to="/dashboard">Huỷ</Link></Button>
          <Button asChild><Link to="/surveys/$id/submit/thank-you" params={{ id }}>Gửi khảo sát</Link></Button>
        </div>
      </div>
    </div>
  );
}
