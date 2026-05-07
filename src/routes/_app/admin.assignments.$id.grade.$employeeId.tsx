import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { aiGradeEssay } from "@/lib/ai-mock";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/assignments/$id/grade/$employeeId")({
  head: () => ({ meta: [{ title: "Chấm bài — OnAir TMS" }] }),
  component: GradePage,
});

const QUESTION = "Trình bày quy trình pha chế Phin Sữa Đá chuẩn Highlands Coffee.";
const ANSWER = "Bước 1: vệ sinh phin và dụng cụ. Bước 2: cho 20g cà phê vào phin, lắc nhẹ cho đều. Bước 3: chế nước nóng 90-96°C theo tỷ lệ chuẩn. Bước 4: chờ cà phê nhỏ giọt hết, thêm sữa đặc và đá. Lưu ý kiểm tra chất lượng trước khi đưa cho khách.";

function GradePage() {
  const { id, employeeId } = Route.useParams();
  const [score, setScore] = useState<number>(8);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ score: number; feedback: string } | null>(null);

  async function suggest() {
    setLoading(true);
    setAiResult(null);
    try {
      const r = await aiGradeEssay(QUESTION, ANSWER);
      setAiResult(r);
    } catch {
      toast.error("Có gì đó chưa đúng, thử lại nhé.");
    } finally {
      setLoading(false);
    }
  }

  function accept() {
    if (!aiResult) return;
    setScore(aiResult.score);
    setFeedback(aiResult.feedback);
    toast.success("Đã áp dụng gợi ý của AI.");
  }

  return (
    <PageContainer
      title="Chấm bài kiểm tra"
      breadcrumbs={[
        { title: "Bài kiểm tra", path: "/admin/assignments" },
        { title: "Chi tiết", path: `/admin/assignments/${id}` },
        { title: `Học viên #${employeeId}` },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="font-semibold">Câu 1. {QUESTION}</h3>
              <p className="mt-2 rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-line">{ANSWER}</p>

              <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs text-muted-foreground">Trainer có thể nhờ AI gợi ý điểm rồi tùy chỉnh lại.</span>
                <Button
                  size="sm"
                  onClick={suggest}
                  disabled={loading}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  {loading ? "Để mình xem qua nhé..." : "Gợi ý điểm và nhận xét cho bài này"}
                </Button>
              </div>

              {(loading || aiResult) && (
                <Card className="mt-3 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50">
                  <CardContent className="p-4">
                    {loading && <AiSpinner label="Để mình xem qua nhé..." />}
                    {aiResult && !loading && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-violet-600" />
                          <span className="font-semibold text-sm text-violet-900">Gợi ý của AI</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Điểm gợi ý: </span>
                          <span className="text-2xl font-bold text-violet-700">{aiResult.score}</span>
                          <span className="text-muted-foreground"> / 10</span>
                        </div>
                        <p className="text-sm leading-relaxed">{aiResult.feedback}</p>
                        <Button size="sm" onClick={accept} variant="outline" className="border-violet-300">
                          <CheckCircle2 className="h-4 w-4 mr-1.5" /> Áp dụng gợi ý
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="mt-4 grid grid-cols-[120px_1fr] items-center gap-3">
                <Label>Điểm</Label>
                <Input type="number" min={0} max={10} step={0.5} value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-24" />
              </div>
              <div className="mt-3 grid grid-cols-[120px_1fr] items-start gap-3">
                <Label>Nhận xét</Label>
                <Textarea rows={4} placeholder="Nhập nhận xét..." value={feedback} onChange={(e) => setFeedback(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="text-sm text-muted-foreground">Tổng điểm</div>
            <div className="text-3xl font-bold">{score} / 10</div>
            <Button className="w-full" onClick={() => toast.success("Đã lưu kết quả chấm.")}>Lưu kết quả chấm</Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/assignments/$id/students" params={{ id }}>Quay lại danh sách</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
