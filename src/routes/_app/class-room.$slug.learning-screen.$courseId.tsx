import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2, PlayCircle, Sparkles } from "lucide-react";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { aiSummarizeLesson } from "@/lib/ai-mock";

export const Route = createFileRoute("/_app/class-room/$slug/learning-screen/$courseId")({
  head: () => ({ meta: [{ title: "Học — OnAir TMS" }] }),
  component: LS,
});

function LS() {
  const { slug, courseId } = Route.useParams();
  const lessonTitle = "Component";

  // Cache summaries per lesson title
  const [summaries, setSummaries] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const current = summaries[lessonTitle];

  async function runSummary() {
    if (current || loading) return;
    setLoading(true);
    try {
      const bullets = await aiSummarizeLesson(lessonTitle);
      setSummaries((prev) => ({ ...prev, [lessonTitle]: bullets }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="w-80 border-r bg-card overflow-y-auto">
        <div className="p-4 border-b">
          <Button variant="ghost" size="sm" asChild className="mb-2"><Link to="/class-room/$slug" params={{ slug }}><ChevronLeft className="h-4 w-4" />Quay lại</Link></Button>
          <div className="font-semibold">React Cơ bản</div>
          <div className="text-xs text-muted-foreground">Khóa #{courseId}</div>
        </div>
        <div className="p-2 space-y-1">
          {[["Giới thiệu", true], ["JSX", true], ["Component", false], ["Props & State", false], ["Hooks", false]].map(([t, done], i) => (
            <button key={i} className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted text-left text-sm">
              {done ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <PlayCircle className="h-4 w-4 text-muted-foreground" />}
              <span className={done ? "text-muted-foreground" : ""}>{t as string}</span>
            </button>
          ))}
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <Card><CardContent className="p-0 aspect-video bg-black flex items-center justify-center text-white">Video player</CardContent></Card>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Bài học: {lessonTitle}</h1>
          <Button
            onClick={runSummary}
            disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white"
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            {current ? "Đã tóm tắt" : "Tóm tắt bằng AI"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Mô tả bài học và tài liệu đính kèm.</p>

        {(loading || current) && (
          <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-violet-600" />
                <span className="font-semibold text-sm text-violet-900">AI tóm tắt bài học</span>
              </div>
              {loading && <AiSpinner label="AI đang đọc nội dung và tóm tắt..." />}
              {current && (
                <ul className="space-y-2">
                  {current.map((b, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed">
                      <span className="text-violet-600 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="outline">Bài trước</Button>
          <Button>Đánh dấu hoàn thành</Button>
        </div>
      </main>
    </div>
  );
}
