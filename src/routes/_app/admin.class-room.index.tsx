import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, MoreVertical, RotateCcw, Users, Video, MonitorPlay, MapPin, Eye, Pencil, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useClassrooms, useClassroomMutations, type DBClassroom } from "@/lib/data-hooks";
import { CLASSROOM_DELIVERY, CLASSROOM_MODE } from "@/lib/admin-options";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/class-room/")({
  head: () => ({ meta: [{ title: "Danh sách lớp học — OnAir TMS" }] }),
  component: Page,
});

const statusBadge: Record<string, { label: string; cls: string }> = {
  upcoming: { label: "Sắp diễn ra", cls: "bg-sky-50 text-sky-700 border border-sky-200" },
  ongoing: { label: "Đang diễn ra", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  completed: { label: "Đã diễn ra", cls: "bg-slate-50 text-slate-600 border border-slate-200" },
  cancelled: { label: "Đã huỷ", cls: "bg-rose-50 text-rose-700 border border-rose-200" },
};

function deliveryChip(r: DBClassroom) {
  const delivery = (r.delivery ?? r.type) as string;
  const mode = r.mode ?? "single";
  const modeLbl = mode === "series" ? "Chuỗi" : "Đơn";
  if (delivery === "live") return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 text-xs font-medium"><Video className="h-3.5 w-3.5" /> Live - {modeLbl}</span>;
  if (delivery === "online") return <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 text-xs font-medium"><MonitorPlay className="h-3.5 w-3.5" /> Online - {modeLbl}</span>;
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 text-xs font-medium"><MapPin className="h-3.5 w-3.5" /> Offline - {modeLbl}</span>;
}

function fmtRange(s?: string | null, e?: string | null) {
  const fmt = (d?: string | null) => {
    if (!d) return "—";
    const dt = new Date(d);
    const hh = String(dt.getHours()).padStart(2, "0");
    const mm = String(dt.getMinutes()).padStart(2, "0");
    return `${hh}:${mm} | ${dt.toLocaleDateString("vi-VN")}`;
  };
  return (
    <div className="text-sm leading-5">
      <div>{fmt(s)}</div>
      <div>{fmt(e)}</div>
    </div>
  );
}

function Page() {
  const { data: rows = [], isLoading } = useClassrooms();
  const m = useClassroomMutations();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("all");
  const [delivery, setDelivery] = useState("all");
  const [mode, setMode] = useState("all");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<DBClassroom | null>(null);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const fromTs = from ? new Date(from).getTime() : null;
    const toTs = to ? new Date(to).getTime() + 86400000 : null;
    return rows.filter(r => {
      if (status !== "all" && r.status !== status) return false;
      const d = (r.delivery ?? r.type) as string;
      if (delivery !== "all" && d !== delivery) return false;
      if (mode !== "all" && (r.mode ?? "single") !== mode) return false;
      if (ql && !(r.title.toLowerCase().includes(ql) || r.code?.toLowerCase().includes(ql))) return false;
      const ts = r.start_at ? new Date(r.start_at).getTime() : (r.start_date ? new Date(r.start_date).getTime() : 0);
      if (fromTs && ts && ts < fromTs) return false;
      if (toTs && ts && ts > toTs) return false;
      return true;
    });
  }, [rows, q, status, delivery, mode, from, to]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function reset() { setQ(""); setStatus("all"); setDelivery("all"); setMode("all"); setFrom(""); setTo(""); setPage(1); }

  return (
    <PageContainer
      title="Danh sách lớp học"
      breadcrumbs={[{ title: "LMS" }, { title: "Quản lý lớp học" }, { title: "Danh sách lớp học" }]}
    >
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Tìm kiếm..." className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Ngày bắt đầu</label>
              <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Ngày kết thúc</label>
              <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Trạng thái diễn ra</label>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(statusBadge).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Loại lớp học</label>
              <Select value={delivery} onValueChange={(v) => { setDelivery(v); setPage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {CLASSROOM_DELIVERY.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Hình thức buổi học</label>
              <Select value={mode} onValueChange={(v) => { setMode(v); setPage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {CLASSROOM_MODE.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="icon" onClick={reset} title="Đặt lại"><RotateCcw className="h-4 w-4" /></Button>
            <Button asChild>
              <Link to="/admin/class-room/new"><Plus className="h-4 w-4" /> Tạo lớp học</Link>
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
              <Video className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 font-semibold">Chưa có lớp học</h3>
              <p className="text-sm text-muted-foreground">Tạo lớp học đầu tiên cho tổ chức.</p>
              <Button asChild className="mt-4" size="sm">
                <Link to="/admin/class-room/new"><Plus className="h-4 w-4" /> Tạo lớp học</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead>Tên lớp học</TableHead>
                  <TableHead>Loại lớp học</TableHead>
                  <TableHead className="text-center">Học viên</TableHead>
                  <TableHead>Trạng thái diễn ra</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead className="text-right pr-6">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((r, idx) => (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell className="text-muted-foreground">{String((page - 1) * pageSize + idx + 1).padStart(2, "0")}</TableCell>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell>{deliveryChip(r)}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 text-sm"><Users className="h-3.5 w-3.5 text-muted-foreground" /> {r.students_count ?? 0}</span>
                    </TableCell>
                    <TableCell><Badge className={statusBadge[r.status]?.cls + " font-medium hover:opacity-100"} variant="outline">{statusBadge[r.status]?.label ?? r.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{fmtRange(r.start_at ?? r.start_date, r.end_at ?? r.end_date)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => navigate({ to: "/admin/class-room/$id/students", params: { id: r.id } })}>
                            <Eye className="h-4 w-4" /> Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate({ to: "/admin/class-room/$id/edit", params: { id: r.id } })}>
                            <Pencil className="h-4 w-4" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-700" onClick={() => setToDelete(r)}>
                            <Trash2 className="h-4 w-4" /> Xoá lớp học
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            <AlertDialogTitle>Xoá lớp học?</AlertDialogTitle>
            <AlertDialogDescription>Lớp "{toDelete?.title}" sẽ bị xoá vĩnh viễn.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!toDelete) return;
              try { await m.remove.mutateAsync(toDelete.id); toast.success("Đã xoá lớp học"); } catch { /* */ }
              setToDelete(null);
            }}>Xoá</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
