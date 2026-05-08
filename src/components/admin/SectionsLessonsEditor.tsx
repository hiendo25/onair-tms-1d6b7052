import { useRef, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, Pencil, GripVertical, Upload, FileText, Video, FileArchive, ListChecks, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type EditorSection = {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  lessons: EditorLesson[];
  _new?: boolean;
};
export type EditorLesson = {
  id: string;
  title: string;
  description: string;
  lesson_type: "video" | "pdf" | "scorm" | "quiz";
  content_url: string;
  content_meta: Record<string, unknown>;
  quiz_assignment_id: string | null;
  duration_seconds: number;
  sort_order: number;
  _new?: boolean;
};

const LESSON_TYPES = [
  { value: "video", label: "Video", icon: Video, accept: "video/mp4,video/quicktime", maxMB: 500 },
  { value: "pdf", label: "Tài liệu PDF", icon: FileText, accept: "application/pdf", maxMB: 50 },
  { value: "scorm", label: "SCORM Package", icon: FileArchive, accept: ".zip,application/zip", maxMB: 200 },
  { value: "quiz", label: "Bài kiểm tra", icon: ListChecks, accept: "", maxMB: 0 },
] as const;

interface Props {
  sections: EditorSection[];
  onChange: (sections: EditorSection[]) => void;
}

let tmpId = 0;
const newId = () => `tmp-${++tmpId}`;

export function SectionsLessonsEditor({ sections, onChange }: Props) {
  const [openSec, setOpenSec] = useState<Record<string, boolean>>({});
  const [editingSec, setEditingSec] = useState<EditorSection | null>(null);
  const [editingLes, setEditingLes] = useState<{ section: EditorSection; lesson: EditorLesson } | null>(null);
  const [delSec, setDelSec] = useState<EditorSection | null>(null);
  const [delLes, setDelLes] = useState<{ section: EditorSection; lesson: EditorLesson } | null>(null);

  const toggle = (id: string) => setOpenSec((s) => ({ ...s, [id]: !s[id] }));

  const addSection = () => {
    const s: EditorSection = {
      id: newId(),
      title: `Học phần ${sections.length + 1}`,
      description: "",
      sort_order: sections.length,
      lessons: [],
      _new: true,
    };
    onChange([...sections, s]);
    setOpenSec((o) => ({ ...o, [s.id]: true }));
    setEditingSec(s);
  };

  const updateSection = (id: string, patch: Partial<EditorSection>) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSection = (id: string) => {
    const s = sections.find((x) => x.id === id);
    if (s && s.lessons.length > 0) {
      toast.error("Không thể xóa học phần đang chứa bài học");
      return;
    }
    onChange(sections.filter((x) => x.id !== id).map((x, i) => ({ ...x, sort_order: i })));
  };

  const moveSection = (id: string, dir: -1 | 1) => {
    const idx = sections.findIndex((s) => s.id === id);
    const tgt = idx + dir;
    if (tgt < 0 || tgt >= sections.length) return;
    const arr = [...sections];
    [arr[idx], arr[tgt]] = [arr[tgt], arr[idx]];
    onChange(arr.map((s, i) => ({ ...s, sort_order: i })));
  };

  const addLesson = (sectionId: string) => {
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec) return;
    const l: EditorLesson = {
      id: newId(),
      title: `Bài học ${sec.lessons.length + 1}`,
      description: "",
      lesson_type: "video",
      content_url: "",
      content_meta: {},
      quiz_assignment_id: null,
      duration_seconds: 0,
      sort_order: sec.lessons.length,
      _new: true,
    };
    updateSection(sectionId, { lessons: [...sec.lessons, l] });
    setEditingLes({ section: { ...sec, lessons: [...sec.lessons, l] }, lesson: l });
  };

  const updateLesson = (sectionId: string, lessonId: string, patch: Partial<EditorLesson>) => {
    onChange(sections.map((s) => s.id === sectionId
      ? { ...s, lessons: s.lessons.map((l) => l.id === lessonId ? { ...l, ...patch } : l) }
      : s));
  };

  const removeLesson = (sectionId: string, lessonId: string) => {
    onChange(sections.map((s) => s.id === sectionId
      ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId).map((l, i) => ({ ...l, sort_order: i })) }
      : s));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Học phần & Bài học</h3>
        <Button onClick={addSection} size="sm"><Plus className="h-4 w-4 mr-1" />Thêm học phần</Button>
      </div>

      {sections.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          Chưa có học phần. Nhấn "Thêm học phần" để bắt đầu.
        </Card>
      )}

      {sections.map((sec, sIdx) => {
        const open = openSec[sec.id] ?? true;
        return (
          <Card key={sec.id} className="overflow-hidden">
            <div className="flex items-center gap-2 p-3 bg-muted/30 border-b">
              <button onClick={() => toggle(sec.id)} className="p-1 hover:bg-muted rounded">
                {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              <span className="text-xs text-muted-foreground">#{sIdx + 1}</span>
              <span className="font-medium flex-1 truncate">{sec.title}</span>
              <Badge variant="outline">{sec.lessons.length} bài</Badge>
              <Button size="sm" variant="ghost" onClick={() => moveSection(sec.id, -1)} disabled={sIdx === 0}>↑</Button>
              <Button size="sm" variant="ghost" onClick={() => moveSection(sec.id, 1)} disabled={sIdx === sections.length - 1}>↓</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingSec(sec)}><Pencil className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDelSec(sec)}><Trash2 className="h-4 w-4" /></Button>
            </div>
            {open && (
              <div className="p-3 space-y-2">
                {sec.description && <p className="text-sm text-muted-foreground mb-2">{sec.description}</p>}
                {sec.lessons.map((les, lIdx) => {
                  const T = LESSON_TYPES.find((t) => t.value === les.lesson_type);
                  const Icon = T?.icon ?? FileText;
                  const hasContent = les.lesson_type === "quiz" ? !!les.quiz_assignment_id : !!les.content_url;
                  return (
                    <div key={les.id} className="flex items-center gap-2 p-2 border rounded hover:bg-muted/30">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{lIdx + 1}.</span>
                      <span className="flex-1 truncate text-sm">{les.title}</span>
                      <Badge variant={hasContent ? "default" : "destructive"} className="text-xs">{T?.label}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => setEditingLes({ section: sec, lesson: les })}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDelLes({ section: sec, lesson: les })}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  );
                })}
                <Button size="sm" variant="outline" className="w-full" onClick={() => addLesson(sec.id)}>
                  <Plus className="h-4 w-4 mr-1" />Thêm bài học
                </Button>
              </div>
            )}
          </Card>
        );
      })}

      {/* Section dialog */}
      <Dialog open={!!editingSec} onOpenChange={(v) => !v && setEditingSec(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Học phần</DialogTitle></DialogHeader>
          {editingSec && (
            <div className="space-y-3">
              <div>
                <Label>Tên học phần *</Label>
                <Input value={editingSec.title} onChange={(e) => setEditingSec({ ...editingSec, title: e.target.value })} />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea rows={3} value={editingSec.description} onChange={(e) => setEditingSec({ ...editingSec, description: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSec(null)}>Huỷ</Button>
            <Button onClick={() => {
              if (!editingSec) return;
              if (!editingSec.title.trim()) { toast.error("Tên học phần không được trống"); return; }
              updateSection(editingSec.id, { title: editingSec.title, description: editingSec.description });
              setEditingSec(null);
            }}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson dialog */}
      <LessonDialog
        editing={editingLes}
        onClose={() => setEditingLes(null)}
        onSave={(lesson) => {
          if (!editingLes) return;
          updateLesson(editingLes.section.id, editingLes.lesson.id, lesson);
          setEditingLes(null);
        }}
      />

      <ConfirmDelete open={!!delSec} onOpenChange={(v) => !v && setDelSec(null)} onConfirm={async () => { if (delSec) { removeSection(delSec.id); setDelSec(null); } }} />
      <ConfirmDelete open={!!delLes} onOpenChange={(v) => !v && setDelLes(null)} onConfirm={async () => { if (delLes) { removeLesson(delLes.section.id, delLes.lesson.id); setDelLes(null); } }} />
    </div>
  );
}

function LessonDialog({ editing, onClose, onSave }: { editing: { section: EditorSection; lesson: EditorLesson } | null; onClose: () => void; onSave: (l: Partial<EditorLesson>) => void }) {
  const [draft, setDraft] = useState<EditorLesson | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // sync when editing changes
  if (editing && (!draft || draft.id !== editing.lesson.id)) {
    setDraft({ ...editing.lesson });
  }
  if (!editing && draft) setDraft(null);

  if (!editing || !draft) return null;
  const T = LESSON_TYPES.find((t) => t.value === draft.lesson_type)!;

  const upload = async (file: File) => {
    if (T.maxMB && file.size > T.maxMB * 1024 * 1024) {
      toast.error(`File vượt quá ${T.maxMB}MB`); return;
    }
    setUploading(true);
    try {
      const path = `lessons/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("course-content").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("course-content").getPublicUrl(path);
      setDraft({ ...draft, content_url: data.publicUrl, content_meta: { ...draft.content_meta, filename: file.name, size: file.size } });
      toast.success("Đã upload");
    } catch (e) { toast.error((e as Error).message); }
    finally { setUploading(false); }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Bài học</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tên bài học *</Label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div>
            <Label>Mô tả</Label>
            <Textarea rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <div>
            <Label>Loại nội dung *</Label>
            <Select value={draft.lesson_type} onValueChange={(v) => setDraft({ ...draft, lesson_type: v as EditorLesson["lesson_type"], content_url: "", content_meta: {}, quiz_assignment_id: null })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LESSON_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {draft.lesson_type === "video" && "MP4/MOV, tối đa 500MB. Khuyến nghị 720p–1080p, ≤ 30 phút"}
              {draft.lesson_type === "pdf" && "PDF, tối đa 50MB, khuyến nghị ≤ 100 trang"}
              {draft.lesson_type === "scorm" && "SCORM 1.2/2004 (.zip), tối đa 200MB, chứa imsmanifest.xml"}
              {draft.lesson_type === "quiz" && "Chọn từ Question Bank, ≥1 câu hỏi (khuyến nghị 5–20)"}
            </p>
          </div>

          {draft.lesson_type !== "quiz" ? (
            <div>
              <Label>File nội dung *</Label>
              <div className="mt-2 flex items-center gap-3">
                <input ref={fileRef} type="file" accept={T.accept} hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {uploading ? "Đang tải..." : "Chọn file"}
                </Button>
                {draft.content_url && (
                  <>
                    <span className="text-sm text-muted-foreground truncate flex-1">{(draft.content_meta?.filename as string) || draft.content_url}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setDraft({ ...draft, content_url: "", content_meta: {} })}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div>
              <Label>Mã bài kiểm tra (Question Bank ID) *</Label>
              <Input
                value={draft.quiz_assignment_id || ""}
                onChange={(e) => setDraft({ ...draft, quiz_assignment_id: e.target.value || null })}
                placeholder="UUID của assignment"
              />
              <p className="text-xs text-muted-foreground mt-1">Sẽ liên kết tới ngân hàng câu hỏi đã có.</p>
            </div>
          )}

          {draft.lesson_type === "video" && (
            <div>
              <Label>Thời lượng (giây)</Label>
              <Input type="number" min={0} value={draft.duration_seconds} onChange={(e) => setDraft({ ...draft, duration_seconds: Math.max(0, Number(e.target.value) || 0) })} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button onClick={() => {
            if (!draft.title.trim()) { toast.error("Tên bài học không được trống"); return; }
            const hasContent = draft.lesson_type === "quiz" ? !!draft.quiz_assignment_id : !!draft.content_url;
            if (!hasContent) { toast.error("Vui lòng thêm nội dung bài học"); return; }
            onSave(draft);
          }}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
