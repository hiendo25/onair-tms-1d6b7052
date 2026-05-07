import { useState } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { aiGenerateCourseOutline, type AiCourseOutline } from "@/lib/ai-mock";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function AiGenerateCourseButton() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState<3 | 5 | 10>(5);
  const [audience, setAudience] = useState("nhân viên pha chế mới");
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState<AiCourseOutline | null>(null);
  const [saving, setSaving] = useState(false);
  const { orgId } = useOrg();
  const qc = useQueryClient();

  function reset() {
    setTopic(""); setOutline(null); setLoading(false); setSaving(false);
  }

  async function generate() {
    if (!topic.trim()) { toast.error("Vui lòng nhập chủ đề."); return; }
    setLoading(true);
    setOutline(null);
    try { setOutline(await aiGenerateCourseOutline(topic, count, audience)); }
    catch { toast.error("Tạo khóa học thất bại."); }
    finally { setLoading(false); }
  }

  async function save() {
    if (!outline || !orgId) return;
    setSaving(true);
    try {
      const code = `AI-${Date.now().toString(36).toUpperCase()}`;
      const { data: course, error: ce } = await supabase.from("online_courses").insert({
        org_id: orgId, code, title: outline.title, description: outline.description,
        category: outline.category, level: outline.level, duration_minutes: outline.duration_minutes,
        instructor: "AI", lessons_count: outline.modules.reduce((s, m) => s + m.lessons.length, 0),
        students_count: 0, status: "draft", cover_url: "", is_required: false,
      }).select("id").single();
      if (ce || !course) throw ce ?? new Error("create course failed");

      for (let si = 0; si < outline.modules.length; si++) {
        const mod = outline.modules[si];
        const { data: sec, error: se } = await supabase.from("course_sections").insert({
          org_id: orgId, course_id: course.id, title: mod.title,
          description: mod.description, sort_order: si, status: "active",
        }).select("id").single();
        if (se || !sec) throw se ?? new Error("create section failed");

        const lessonRows = mod.lessons.map((ltitle, li) => ({
          org_id: orgId, course_id: course.id, section_id: sec.id,
          title: ltitle, content: `Nội dung do AI sinh cho ${ltitle}.`,
          lesson_type: "file", sort_order: li, status: "active",
        }));
        const { error: le } = await supabase.from("course_lessons").insert(lessonRows);
        if (le) throw le;
      }

      toast.success(`Đã tạo khóa "${outline.title}" với ${outline.modules.length} phần.`);
      qc.invalidateQueries({ queryKey: ["online_courses"] });
      setOpen(false); reset();
    } catch (e) {
      toast.error("Lưu thất bại: " + (e instanceof Error ? e.message : "Unknown"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => { reset(); setOpen(true); }}
        className="border-violet-300 text-violet-700">
        <Sparkles className="h-4 w-4" /> Giúp tôi tạo nội dung
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" /> Tạo khóa học tự động bằng AI
            </DialogTitle>
          </DialogHeader>

          {!outline && !loading && (
            <div className="space-y-3">
              <div>
                <Label>Chủ đề</Label>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="VD: Pha chế cà phê Phin chuẩn Highlands" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Số bài học</Label>
                  <Select value={String(count)} onValueChange={(v) => setCount(Number(v) as 3 | 5 | 10)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 bài</SelectItem>
                      <SelectItem value="5">5 bài</SelectItem>
                      <SelectItem value="10">10 bài</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Đối tượng học viên</Label>
                  <Input value={audience} onChange={(e) => setAudience(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {loading && <AiSpinner label="Để mình xem qua nhé..." />}

          {outline && !loading && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="rounded-lg bg-violet-50 border border-violet-200 p-4">
                <div className="font-semibold text-base">{outline.title}</div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{outline.description}</p>
                <div className="text-xs text-muted-foreground mt-2">
                  {outline.modules.length} phần · {outline.modules.reduce((s, m) => s + m.lessons.length, 0)} bài · {outline.duration_minutes} phút
                </div>
              </div>
              {outline.modules.map((m, i) => (
                <div key={i} className="rounded-lg border p-3 space-y-2">
                  <div className="font-semibold text-sm">{m.title}</div>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                  <div>
                    <div className="text-xs font-semibold mb-1">📚 Bài học:</div>
                    <ul className="text-xs space-y-0.5 pl-4 list-disc">
                      {m.lessons.map((l, li) => <li key={li}>{l}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-1">❓ Câu hỏi mẫu ({m.sample_questions.length}):</div>
                    <ul className="text-xs space-y-0.5 pl-4 list-disc text-muted-foreground">
                      {m.sample_questions.slice(0, 2).map((q, qi) => <li key={qi}>{q.question}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            {!outline && <Button onClick={generate} disabled={loading}><Sparkles className="h-4 w-4 mr-1.5" />Sinh outline</Button>}
            {outline && (
              <>
                <Button variant="outline" onClick={() => setOutline(null)}>Sinh lại</Button>
                <Button onClick={save} disabled={saving}>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />{saving ? "Đang lưu..." : "Xác nhận & Lưu"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
