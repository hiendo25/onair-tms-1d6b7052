import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2, PlayCircle, Sparkles } from "lucide-react";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { aiSummarizeLesson, aiGenerateFlashcards, type AiFlashcard } from "@/lib/ai-mock";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/class-room/$slug/learning-screen/$courseId")({
  head: () => ({ meta: [{ title: "Học — OnAir TMS" }] }),
  component: LS,
});

type LessonRow = { id: string; title: string; section_id: string; sort_order: number; content: string };
type SectionRow = { id: string; title: string; sort_order: number };
type CourseData = {
  course: { id: string; title: string } | null;
  sections: SectionRow[];
  lessons: LessonRow[];
};

function useCourseData(orgId: string, courseId: string) {
  return useQuery<CourseData>({
    queryKey: ["learning-screen", orgId, courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const [{ data: course }, { data: sections }, { data: lessons }] = await Promise.all([
        supabase.from("online_courses").select("id, title").eq("id", courseId).maybeSingle(),
        supabase.from("course_sections").select("id, title, sort_order")
          .eq("course_id", courseId).eq("org_id", orgId).order("sort_order", { ascending: true }),
        supabase.from("course_lessons").select("id, title, section_id, sort_order, content")
          .eq("course_id", courseId).eq("org_id", orgId).order("sort_order", { ascending: true }),
      ]);
      return {
        course: course ?? null,
        sections: (sections ?? []) as SectionRow[],
        lessons: (lessons ?? []) as LessonRow[],
      };
    },
  });
}

function LS() {
  const { slug, courseId } = Route.useParams();
  const { orgId } = useOrg();
  const { data, isLoading } = useCourseData(orgId, courseId);

  const lessons = data?.lessons ?? [];
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  // Pick first lesson once data arrives
  useEffect(() => {
    if (!currentLessonId && lessons.length > 0) {
      setCurrentLessonId(lessons[0].id);
    }
  }, [lessons, currentLessonId]);

  const currentLesson = useMemo(
    () => lessons.find((l) => l.id === currentLessonId) ?? null,
    [lessons, currentLessonId],
  );
  const lessonTitle = currentLesson?.title ?? data?.course?.title ?? "";
  const courseTitle = data?.course?.title ?? "Khóa học";

  // Cache summaries per lesson id
  const [summaries, setSummaries] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const cacheKey = currentLessonId ?? "";
  const current = summaries[cacheKey];

  async function runSummary() {
    if (!cacheKey || !lessonTitle || current || loading) return;
    setLoading(true);
    try {
      const bullets = await aiSummarizeLesson(lessonTitle);
      setSummaries((prev) => ({ ...prev, [cacheKey]: bullets }));
    } finally {
      setLoading(false);
    }
  }

  // Flashcards
  const [flashOpen, setFlashOpen] = useState(false);
  const [flashLoading, setFlashLoading] = useState(false);
  const [flashCards, setFlashCards] = useState<AiFlashcard[] | null>(null);
  const [flippedIdx, setFlippedIdx] = useState<Record<number, boolean>>({});

  async function genFlashcards() {
    setFlashOpen(true);
    setFlashCards(null);
    setFlippedIdx({});
    setFlashLoading(true);
    try { setFlashCards(await aiGenerateFlashcards(lessonTitle)); }
    catch { toast.error("Không sinh được flashcard."); }
    finally { setFlashLoading(false); }
  }

  async function saveFlashcards() {
    if (!flashCards || !orgId) return;
    const code = `FC-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from("flashcards").insert({
      org_id: orgId, code, title: `Flashcard: ${lessonTitle}`,
      description: `Sinh tự động bằng AI cho bài "${lessonTitle}"`,
      category: "AI generated", cards_count: flashCards.length, status: "draft",
    });
    if (error) { toast.error("Lưu thất bại: " + error.message); return; }
    toast.success(`Đã lưu ${flashCards.length} flashcard.`);
    setFlashOpen(false);
  }


  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="w-80 border-r bg-card overflow-y-auto">
        <div className="p-4 border-b">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link to="/class-room/$slug" params={{ slug }}><ChevronLeft className="h-4 w-4" />Quay lại</Link>
          </Button>
          <div className="font-semibold line-clamp-2">{courseTitle}</div>
          <div className="text-xs text-muted-foreground">{lessons.length} bài học</div>
        </div>
        <div className="p-2 space-y-1">
          {isLoading && <div className="p-3 text-sm text-muted-foreground">Đang tải bài học...</div>}
          {!isLoading && lessons.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">Khóa học chưa có bài học.</div>
          )}
          {lessons.map((l) => {
            const active = l.id === currentLessonId;
            return (
              <button
                key={l.id}
                onClick={() => setCurrentLessonId(l.id)}
                className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm transition ${
                  active ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                }`}
              >
                <PlayCircle className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className="truncate">{l.title}</span>
              </button>
            );
          })}
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <Card>
          <CardContent className="p-0 aspect-video bg-black flex items-center justify-center text-white">
            Video player
          </CardContent>
        </Card>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-xl font-semibold">
            {currentLesson ? `Bài học: ${currentLesson.title}` : "Chọn một bài học"}
          </h1>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={genFlashcards} disabled={!currentLesson} variant="outline" className="border-violet-300 text-violet-700">
              <Sparkles className="h-4 w-4 mr-1.5" /> Tạo flashcard
            </Button>
            <Button
              onClick={runSummary}
              disabled={loading || !currentLesson}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              {current ? "Đã tóm tắt" : "Tóm tắt bằng AI"}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {currentLesson?.content || "Chưa có mô tả cho bài học này."}
        </p>

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
          <Button
            variant="outline"
            disabled={!currentLessonId || lessons.findIndex((l) => l.id === currentLessonId) <= 0}
            onClick={() => {
              const i = lessons.findIndex((l) => l.id === currentLessonId);
              if (i > 0) setCurrentLessonId(lessons[i - 1].id);
            }}
          >
            Bài trước
          </Button>
          <Button
            disabled={!currentLessonId || lessons.findIndex((l) => l.id === currentLessonId) >= lessons.length - 1}
            onClick={() => {
              const i = lessons.findIndex((l) => l.id === currentLessonId);
              if (i >= 0 && i < lessons.length - 1) setCurrentLessonId(lessons[i + 1].id);
            }}
          >
            Bài tiếp theo
          </Button>
        </div>
      </main>

      <Dialog open={flashOpen} onOpenChange={setFlashOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              Flashcard cho bài: {lessonTitle}
            </DialogTitle>
          </DialogHeader>
          {flashLoading && <AiSpinner label="AI đang tạo flashcard..." />}
          {flashCards && !flashLoading && (
            <div className="grid gap-3 sm:grid-cols-2 max-h-[60vh] overflow-y-auto">
              {flashCards.map((c, i) => {
                const flipped = !!flippedIdx[i];
                return (
                  <button
                    key={i}
                    onClick={() => setFlippedIdx((p) => ({ ...p, [i]: !p[i] }))}
                    className={`min-h-[120px] rounded-lg border p-4 text-left text-sm transition ${
                      flipped ? "bg-emerald-50 border-emerald-300" : "bg-violet-50 border-violet-200"
                    }`}
                  >
                    <div className="text-[10px] uppercase font-semibold mb-1 text-muted-foreground">
                      {flipped ? "Đáp án" : `Thẻ ${i + 1}`}
                    </div>
                    <div className="leading-relaxed">{flipped ? c.back : c.front}</div>
                  </button>
                );
              })}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlashOpen(false)}>Hủy</Button>
            <Button onClick={saveFlashcards} disabled={!flashCards || flashLoading}>
              Lưu vào ngân hàng flashcard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Suppress unused warning for sections (kept for future grouping UI)
void ({} as SectionRow);
