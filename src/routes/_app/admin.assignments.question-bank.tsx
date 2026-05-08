import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, FolderPlus, ChevronRight, ChevronDown, Folder, MoreVertical, Pencil, Trash2, HelpCircle, CheckSquare, ArrowLeftRight, FileText, Upload, ArrowUpDown, Link2, Download, Filter as FilterIcon } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import {
  useQuestions, useQuestionMutations, useQuestionFolders, useQuestionFolderMutations,
  useExamQuestions, type DBQuestion, type DBQuestionFolder
} from "@/lib/data-hooks";
import { QUESTION_TYPE, DIFFICULTY, QUESTION_STATUS } from "@/lib/admin-options";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/assignments/question-bank")({
  head: () => ({ meta: [{ title: "Ngân hàng câu hỏi — OnAir TMS" }] }),
  component: Page,
});

function difficultyBadge(d: string) {
  const map: Record<string, string> = {
    easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    hard: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return <Badge variant="outline" className={map[d] || ""}>{DIFFICULTY.find(x => x.value === d)?.label || d}</Badge>;
}

function Page() {
  const { data: rows = [] } = useQuestions();
  const { data: folders = [] } = useQuestionFolders();
  const { data: examQs = [] } = useExamQuestions();
  const qm = useQuestionMutations();
  const fm = useQuestionFolderMutations();

  const [selFolder, setSelFolder] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [fType, setFType] = useState("all");
  const [fDiff, setFDiff] = useState("all");
  const [fStatus, setFStatus] = useState("all");

  const [folderOpen, setFolderOpen] = useState<{ parent: string | null; editing: DBQuestionFolder | null } | null>(null);
  const [folderName, setFolderName] = useState("");
  const [delFolder, setDelFolder] = useState<DBQuestionFolder | null>(null);
  const [delQ, setDelQ] = useState<DBQuestion | null>(null);

  const usedQuestionIds = useMemo(() => new Set(examQs.map(e => e.question_id)), [examQs]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (selFolder && r.folder_id !== selFolder) return false;
      if (q) {
        const t = q.toLowerCase();
        if (!(r.title || "").toLowerCase().includes(t) && !(r.question || "").toLowerCase().includes(t)) return false;
      }
      if (fType !== "all" && r.type !== fType) return false;
      if (fDiff !== "all" && r.difficulty !== fDiff) return false;
      if (fStatus !== "all" && (r.status || "active") !== fStatus) return false;
      return true;
    });
  }, [rows, selFolder, q, fType, fDiff, fStatus]);

  // Build folder tree
  const childMap = useMemo(() => {
    const m = new Map<string | null, DBQuestionFolder[]>();
    folders.forEach(f => {
      const k = f.parent_id;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(f);
    });
    return m;
  }, [folders]);

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  async function saveFolder() {
    if (!folderName.trim()) return toast.error("Tên thư mục là bắt buộc");
    const siblings = folders.filter(f => f.parent_id === (folderOpen?.parent ?? null) && f.id !== folderOpen?.editing?.id);
    if (siblings.some(f => f.name.toLowerCase() === folderName.trim().toLowerCase())) {
      return toast.error("Tên folder đã tồn tại trong cùng cấp");
    }
    if (folderOpen?.editing) {
      await fm.update.mutateAsync({ id: folderOpen.editing.id, name: folderName.trim() });
    } else {
      await fm.create.mutateAsync({ parent_id: folderOpen?.parent ?? null, name: folderName.trim() } as Partial<DBQuestionFolder>);
    }
    setFolderOpen(null);
    setFolderName("");
  }

  async function deleteFolder(f: DBQuestionFolder) {
    const hasChildren = folders.some(x => x.parent_id === f.id);
    const hasQuestions = rows.some(r => r.folder_id === f.id);
    if (hasChildren || hasQuestions) {
      toast.error("Folder còn chứa câu hỏi / folder con. Vui lòng di chuyển hoặc xoá dữ liệu trước");
      return;
    }
    await fm.remove.mutateAsync(f.id);
    setDelFolder(null);
    if (selFolder === f.id) setSelFolder(null);
  }

  function renderFolderNode(f: DBQuestionFolder, depth: number) {
    const children = childMap.get(f.id) || [];
    const isExpanded = expanded.has(f.id);
    const isSel = selFolder === f.id;
    return (
      <div key={f.id}>
        <div
          className={`group flex items-center gap-1 rounded-md py-1.5 pr-1 text-sm cursor-pointer hover:bg-muted ${isSel ? "bg-primary/10 text-primary font-medium" : ""}`}
          style={{ paddingLeft: depth * 16 + 4 }}
          onClick={() => setSelFolder(f.id)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); toggleExpand(f.id); }}
            className="flex h-4 w-4 items-center justify-center"
          >
            {children.length > 0 ? (isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />) : null}
          </button>
          <Folder className="h-4 w-4 shrink-0 text-amber-500" />
          <span className="flex-1 truncate">{f.name}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setFolderOpen({ parent: f.id, editing: null }); setFolderName(""); }}>
                <FolderPlus className="h-4 w-4" /> Thêm folder con
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setFolderOpen({ parent: f.parent_id, editing: f }); setFolderName(f.name); }}>
                <Pencil className="h-4 w-4" /> Đổi tên
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => setDelFolder(f)}>
                <Trash2 className="h-4 w-4" /> Xoá
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isExpanded && children.map(c => renderFolderNode(c, depth + 1))}
      </div>
    );
  }

  const stats = useMemo(() => {
    const total = rows.length;
    const counts: Record<string, number> = {};
    rows.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
    return { total, counts };
  }, [rows]);

  async function handleDeleteQ(qq: DBQuestion) {
    if (usedQuestionIds.has(qq.id)) {
      return toast.error("Câu hỏi đang được sử dụng trong bài kiểm tra. Không thể xoá.");
    }
    await qm.remove.mutateAsync(qq.id);
    setDelQ(null);
  }

  const roots = childMap.get(null) || [];

  return (
    <PageContainer
      title="Ngân hàng câu hỏi"
      breadcrumbs={[{ title: "Bài kiểm tra" }, { title: "Ngân hàng câu hỏi" }]}
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <StatCard label="Tổng câu hỏi" value={stats.total} />
        {QUESTION_TYPE.map(t => (
          <StatCard key={t.value} label={t.label.split(" (")[0]} value={stats.counts[t.value] || 0} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Folder tree */}
        <Card className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Thư mục</span>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setFolderOpen({ parent: null, editing: null }); setFolderName(""); }}>
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
          <div
            className={`mb-1 cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-muted ${selFolder === null ? "bg-primary/10 text-primary font-medium" : ""}`}
            onClick={() => setSelFolder(null)}
          >
            Tất cả câu hỏi
          </div>
          {roots.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs text-muted-foreground">
              Chưa có folder nào.<br />Nhấn + để tạo folder đầu tiên.
            </div>
          ) : (
            roots.map(r => renderFolderNode(r, 0))
          )}
        </Card>

        {/* Right panel */}
        <Card className="p-4">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Tìm kiếm" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <Select value={fType} onValueChange={setFType}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Loại câu hỏi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {QUESTION_TYPE.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fDiff} onValueChange={setFDiff}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Mức độ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mức độ</SelectItem>
                {DIFFICULTY.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fStatus} onValueChange={setFStatus}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {QUESTION_STATUS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button asChild>
              <Link to="/admin/assignments/question-bank/$id/edit" params={{ id: "new" }} search={{ folder: selFolder ?? "" }}>
                <Plus className="h-4 w-4" /> Tạo câu hỏi mới
              </Link>
            </Button>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {rows.length === 0
                ? <>Chưa có câu hỏi nào trong folder này.<br />Nhấn + Tạo câu hỏi để bắt đầu.</>
                : "Không tìm thấy câu hỏi phù hợp"}
            </div>
          ) : (
            <div className="divide-y">
              <div className="grid grid-cols-[40px_1fr_auto] gap-2 py-2 text-xs font-semibold text-muted-foreground">
                <div>STT</div><div>Nội dung câu hỏi</div><div></div>
              </div>
              {filtered.map((r, i) => (
                <div key={r.id} className="grid grid-cols-[40px_1fr_auto] items-center gap-2 py-3 text-sm">
                  <div className="text-muted-foreground">{i + 1}</div>
                  <div>
                    <div className="font-medium">{r.title || r.question}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {difficultyBadge(r.difficulty)}
                      <Badge variant="outline">{QUESTION_TYPE.find(x => x.value === r.type)?.label.split(" (")[0]}</Badge>
                      {r.category && <Badge variant="secondary">{r.category}</Badge>}
                      <Badge variant="outline">{r.points} điểm</Badge>
                      {(r.status || "active") === "inactive" && <Badge className="bg-gray-200 text-gray-700">Ngưng sử dụng</Badge>}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/admin/assignments/question-bank/$id/edit" params={{ id: r.id }} search={{ folder: "" }}><Pencil className="h-4 w-4" /> Chỉnh sửa</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => qm.update.mutateAsync({ id: r.id, status: (r.status || "active") === "active" ? "inactive" : "active" })}>
                        {(r.status || "active") === "active" ? "Ngưng sử dụng" : "Kích hoạt lại"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDelQ(r)}>
                        <Trash2 className="h-4 w-4" /> Xoá
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Folder dialog */}
      <Dialog open={!!folderOpen} onOpenChange={(o) => !o && setFolderOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{folderOpen?.editing ? "Đổi tên folder" : "Tạo folder"}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Tên folder *</Label>
            <Input value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="VD: Công nghệ AI" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderOpen(null)}>Huỷ</Button>
            <Button onClick={saveFolder}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={!!delFolder} onOpenChange={(o) => !o && setDelFolder(null)} title="Xoá folder" description={`Xoá folder "${delFolder?.name}"?`} onConfirm={() => { if (delFolder) deleteFolder(delFolder); }} />
      <ConfirmDelete open={!!delQ} onOpenChange={(o) => !o && setDelQ(null)} title="Xoá câu hỏi" description={`Xoá câu hỏi "${delQ?.title || delQ?.question}"?`} onConfirm={() => { if (delQ) handleDeleteQ(delQ); }} />
    </PageContainer>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </Card>
  );
}
