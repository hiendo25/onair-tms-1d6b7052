import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2, Lock, Unlock, MoreHorizontal, BookOpen } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLearningPaths, useLearningPathMutations, type DBLearningPath } from "@/lib/data-hooks";
import { PATH_STATUS } from "@/lib/admin-options";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/learning-paths")({
  head: () => ({ meta: [{ title: "Lộ trình học — OnAir TMS" }] }),
  component: Page,
});

const statusVariant: Record<string, string> = {
  inactive: "bg-slate-100 text-slate-700",
  active: "bg-emerald-100 text-emerald-700",
  locked: "bg-amber-100 text-amber-700",
};
const statusLabel = (v: string) => PATH_STATUS.find(s => s.value === v)?.label ?? v;

function Page() {
  const { data: rows = [], isLoading } = useLearningPaths();
  const m = useLearningPathMutations();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<DBLearningPath | null>(null);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return rows.filter(r =>
      (status === "all" || r.status === status) &&
      (!ql || r.title.toLowerCase().includes(ql) || r.code.toLowerCase().includes(ql) || (r.category ?? "").toLowerCase().includes(ql))
    );
  }, [rows, q, status]);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function toggleLock(r: DBLearningPath) {
    const next = r.status === "locked" ? "active" : "locked";
    try {
      await m.update.mutateAsync({ id: r.id, status: next } as never);
    } catch { /* toast handled */ }
  }

  return (
    <PageContainer
      title="Lộ trình học tập"
      breadcrumbs={[{ title: "Đào tạo" }, { title: "Lộ trình học tập" }]}
      actions={
        <Button asChild size="sm">
          <Link to="/admin/learning-paths/edit/$id" params={{ id: "new" }}><Plus className="h-4 w-4" /> Tạo lộ trình</Link>
        </Button>
      }
    >
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Tìm theo tên, mã, danh mục..." className="pl-9" />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {PATH_STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
      ) : paged.length === 0 ? (
        <Card><CardContent className="p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 font-semibold">Chưa có lộ trình nào</h3>
          <p className="text-sm text-muted-foreground">Bắt đầu bằng cách tạo lộ trình đầu tiên cho tổ chức.</p>
          <Button asChild className="mt-4" size="sm">
            <Link to="/admin/learning-paths/edit/$id" params={{ id: "new" }}><Plus className="h-4 w-4" /> Tạo lộ trình</Link>
          </Button>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map(r => (
            <Card key={r.id} className="overflow-hidden flex flex-col">
              <div className="relative h-32 bg-gradient-to-br from-primary/10 to-violet-200">
                {r.cover_url ? (
                  <img src={r.cover_url} alt={r.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary/30">
                    <BookOpen className="h-12 w-12" />
                  </div>
                )}
                <Badge className={`absolute left-2 top-2 ${statusVariant[r.status]}`}>{statusLabel(r.status)}</Badge>
                <Badge variant="outline" className="absolute right-2 top-2 bg-white/80">v{r.version ?? 1}</Badge>
              </div>
              <CardContent className="flex-1 flex flex-col p-4 gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="text-[10px]">{r.code}</Badge>
                    <h3 className="mt-1 font-semibold line-clamp-1">{r.title}</h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate({ to: "/admin/learning-paths/$id", params: { id: r.id } })}>
                        <Eye className="h-4 w-4" /> Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate({ to: "/admin/learning-paths/edit/$id", params: { id: r.id } })}
                        disabled={r.status === "locked"}
                      >
                        <Pencil className="h-4 w-4" /> Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleLock(r)}>
                        {r.status === "locked" ? <><Unlock className="h-4 w-4" /> Mở khoá</> : <><Lock className="h-4 w-4" /> Khoá lộ trình</>}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setToDelete(r)}
                        disabled={(r.students_count ?? 0) > 0}
                      >
                        <Trash2 className="h-4 w-4" /> Xoá
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {r.description && <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>}
                <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-2">
                  <span>{r.courses_count ?? 0} khoá</span>
                  <span>·</span>
                  <span>{r.duration_hours ?? 0}h</span>
                  <span>·</span>
                  <span>{r.students_count ?? 0} HV</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Trước</Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Sau</Button>
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá lộ trình?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Lộ trình "{toDelete?.title}" và toàn bộ giai đoạn sẽ bị xoá.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!toDelete) return;
                try { await m.remove.mutateAsync(toDelete.id); toast.success("Đã xoá lộ trình"); }
                catch { /* handled */ }
                setToDelete(null);
              }}
            >Xoá</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
