import { useState } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, AlertCircle, Send } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { MOCK_ASSIGNMENTS, MOCK_QUESTIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/my-assignments/$id/submit")({
  loader: ({ params }) => {
    const a = MOCK_ASSIGNMENTS.find((x) => x.id === params.id);
    if (!a) throw notFound();
    return { assignment: a };
  },
  notFoundComponent: () => <PageContainer title="Không tìm thấy bài"><Button asChild variant="outline"><Link to="/my-assignments"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button></PageContainer>,
  component: SubmitAssignment,
});

function SubmitAssignment() {
  const { assignment: a } = Route.useLoaderData();
  const questions = MOCK_QUESTIONS.slice(0, 4);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answered = Object.keys(answers).filter((k) => answers[k]).length;
  const progress = (answered / questions.length) * 100;

  return (
    <PageContainer
      title={a.title}
      breadcrumbs={[{ title: "Bài kiểm tra", path: "/my-assignments" }, { title: "Làm bài" }]}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="flex items-start gap-3 p-4 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
              <div>
                <div className="font-medium">Lưu ý trước khi làm bài</div>
                <p className="mt-1 text-muted-foreground">Bạn có {a.duration} phút để hoàn thành. Bài sẽ tự động nộp khi hết giờ. Hãy kiểm tra kỹ trước khi nộp.</p>
              </div>
            </CardContent>
          </Card>

          {questions.map((q, i) => (
            <Card key={q.id} id={`q-${i}`}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                  <div className="flex-1">
                    <CardTitle className="text-base">{q.content}</CardTitle>
                    <div className="mt-1 flex gap-2">
                      <Badge variant="outline" className="text-xs">{q.type === "single" ? "Một đáp án" : q.type === "multiple" ? "Nhiều đáp án" : "Tự luận"}</Badge>
                      <Badge variant="secondary" className="text-xs">{q.difficulty}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {q.type === "single" && (
                  <RadioGroup value={answers[q.id]} onValueChange={(v) => setAnswers((s) => ({ ...s, [q.id]: v }))} className="space-y-2">
                    {["A. Lựa chọn thứ nhất", "B. Lựa chọn thứ hai", "C. Lựa chọn thứ ba", "D. Lựa chọn thứ tư"].map((opt) => (
                      <Label key={opt} className="flex items-center gap-3 rounded-md border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 cursor-pointer">
                        <RadioGroupItem value={opt} />
                        <span className="text-sm">{opt}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                )}
                {q.type === "multiple" && (
                  <div className="space-y-2">
                    {["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"].map((opt) => (
                      <Label key={opt} className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                        <Checkbox onCheckedChange={(v) => setAnswers((s) => ({ ...s, [q.id]: v ? opt : "" }))} />
                        <span className="text-sm">{opt}</span>
                      </Label>
                    ))}
                  </div>
                )}
                {q.type === "essay" && (
                  <Textarea
                    rows={6}
                    placeholder="Nhập câu trả lời của bạn..."
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((s) => ({ ...s, [q.id]: e.target.value }))}
                  />
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between">
            <Button variant="outline" asChild><Link to="/my-assignments"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button>
            <Button size="lg"><Send className="h-4 w-4" />Nộp bài</Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4 text-primary" />Thời gian còn lại</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-display text-3xl font-semibold tabular-nums text-primary">{String(a.duration).padStart(2, "0")}:00</div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Tiến độ làm bài</span>
                  <span>{answered}/{questions.length}</span>
                </div>
                <Progress value={progress} className="mt-1.5 h-2" />
              </div>
              <div className="mt-5">
                <div className="mb-2 text-xs font-medium text-muted-foreground">Danh sách câu hỏi</div>
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((q, i) => (
                    <a key={q.id} href={`#q-${i}`} className={`flex h-9 items-center justify-center rounded-md border text-xs font-semibold ${answers[q.id] ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                      {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
