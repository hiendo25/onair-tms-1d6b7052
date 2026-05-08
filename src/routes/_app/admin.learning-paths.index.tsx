import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Eye, Pencil, Trash2, Lock, Unlock, RotateCcw, BookOpen } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLearningPaths, useLearningPathMutations, type DBLearningPath } from "@/lib/data-hooks";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { PATH_STATUS } from "@/lib/admin-options";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/learning-paths/")({
  head: () => ({ meta: [{ title: "Lộ trình học tập — OnAir TMS" }] }),
  component: Page,
});

const statusVariant: Record<string, string> = {
  inactive: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  active: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  locked: "bg-amber-100 text-amber-700 hover:bg-amber-100",
};
const statusLabel = (v: string) => {
  if (v === "active") return "Đang hoạt động";
  if (v === "locked") return "Đã khoá";
  if (v === "inactive") return "Chưa hoạt động";
  return PATH_STATUS.find(s => s.value === v)?.label ?? v;
};

function Page() {
  const { orgId } = useOrg();
  const { data: rows = [], isLoading } = useLearningPaths();
  const m = useLearningPathMutations();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<DBLearningPath | null>(null);

  // Stage counts per path
  const { data: stageCounts = {} } = useQuery({
    queryKey: ["lp-stage-counts", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_path_stages")
        .select("learning_path_id")
        .eq("org_id", orgId);
      if (error) throw error;
      const map: Record<string, number> = {};
      (data ?? []).forEach((r: { learning_path_id: string }) => {
        map[r.learning_path_id] = (map[r.learning_path_id] ?? 0) + 1;
      });
      return map;
    },
  });

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const fromTs = from ? new Date(from).getTime() : null;
    const toTs = to ? new Date(to).getTime() + 86400000 : null;
    return rows.filter(r => {
      if (status !== "all" && r.status !== status) return false;
      if (ql && !(r.title.toLowerCase().includes(ql) || r.code.toLowerCase().includes(ql))) return false;
      const ts = r.published_at ? new Date(r.published_at).getTime() : new Date(r.created_at).getTime();
      if (fromTs && ts < fromTs) return false;
      if (toTs && ts > toTs) return false;
      return true;
    });
  }, [rows, q, status, from, to]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function reset() { setQ(""); setStatus("all"); setFrom(""); setTo(""); setPage(1); }

  async function toggleLock(r: DBLearningPath) {
    const next = r.status === "locked" ? "active" : "locked";
    try { await m.update.mutateAsync({ id: r.id, status: next } as never); } catch { /* */ }
  }

  function fmtDateTime(d?: string | null) {
    if (!d) return "—";
    const dt = new Date(d);
    const hh = String(dt.getHours()).padStart(2, "0");
    const mm = String(dt.getMinutes()).padStart(2, "0");
    return `${hh}:${mm} | ${dt.toLocaleDateString("vi-VN")}`;
  }

  return (
    <PageContainer
      title="Lộ trình học tập"
      breadcrumbs={[{ title: "Lộ trình học tập" }]}
    >
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Tên lộ trình</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Tìm kiếm..." className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Học viên</label>
              <Select disabled>
                <SelectTrigger><SelectValue placeholder="Tất cả học viên" /></SelectTrigger>
                <SelectContent><SelectItem value="all">Tất cả học viên</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Trạng thái</label>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {PATH_STATUS.map(s => <SelectItem key={s.value} value={s.value}>{statusLabel(s.value)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Từ ngày</label>
              <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Đến ngày</label>
              <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="icon" onClick={reset} title="Đặt lại">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button asChild>
              <Link to="/admin/learning-paths/edit/$id" params={{ id: "new" }}><Plus className="h-4 w-4" /> Tạo lộ trình</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : paged.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 font-semibold">Chưa có lộ trình nào</h3>
              <p className="text-sm text-muted-foreground">Bắt đầu bằng cách tạo lộ trình đầu tiên cho tổ chức.</p>
              <Button asChild className="mt-4" size="sm">
                <Link to="/admin/learning-paths/edit/$id" params={{ id: "new" }}><Plus className="h-4 w-4" /> Tạo lộ trình</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead>Tên lộ trình</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-center">Số giai đoạn</TableHead>
                  <TableHead>Ngày phát hành</TableHead>
                  <TableHead className="text-right pr-6">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((r, idx) => (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell className="text-muted-foreground">{(page - 1) * pageSize + idx + 1}</TableCell>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell><Badge className={statusVariant[r.status]}>{statusLabel(r.status)}</Badge></TableCell>
                    <TableCell className="text-center">{stageCounts[r.id] ?? 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDateTime(r.published_at ?? r.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 pr-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700" onClick={() => navigate({ to: "/admin/learning-paths/$id", params: { id: r.id } })} title="Xem chi tiết">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:text-amber-700" onClick={() => navigate({ to: "/admin/learning-paths/edit/$id", params: { id: r.id } })} disabled={r.status === "locked"} title="Chỉnh sửa">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700" onClick={() => toggleLock(r)} title={r.status === "locked" ? "Mở khoá" : "Khoá"}>
                          {r.status === "locked" ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => setToDelete(r)} disabled={(r.students_count ?? 0) > 0} title="Xoá">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-1">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</Button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button key={i} size="sm" variant={page === i + 1 ? "default" : "outline"} onClick={() => setPage(i + 1)}>{i + 1}</Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</Button>
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
                try { await m.remove.mutateAsync(toDelete.id); toast.success("Đã xoá lộ trình"); } catch { /* */ }
                setToDelete(null);
              }}
            >Xoá</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
