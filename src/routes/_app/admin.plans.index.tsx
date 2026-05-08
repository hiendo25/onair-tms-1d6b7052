import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2, Send, MoreVertical, FileText, Hourglass, Clock, CheckCircle2, XCircle } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { usePlans, usePlanMutations, type DBPlan } from "@/lib/data-hooks";
import { PLAN_STATUS_BADGE } from "@/lib/plan-helpers";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useOrg } from "@/lib/org-context";

export const Route = createFileRoute("/_app/admin/plans/")({
  head: () => ({ meta: [{ title: "Kế hoạch đào tạo — OnAir TMS" }] }),
  component: Page,
});

const TABS = [
  { value: "all", label: "Tất cả" },
  { value: "pending_survey", label: "Chờ khảo sát" },
  { value: "pending", label: "Đang chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
] as const;

function Page() {
  const { data: rows = [], isLoading } = usePlans();
  const m = usePlanMutations();
  const qc = useQueryClient();
  const { orgId } = useOrg();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length, pending_survey: 0, pending: 0, approved: 0, rejected: 0, draft: 0 };
    rows.forEach((r) => { c[r.status] = (c[r.status] ?? 0) + 1; });
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (q && !r.title.toLowerCase().includes(q.toLowerCase()) && !r.code.toLowerCase().includes(q.toLowerCase())) return false;
      if (tab !== "all" && r.status !== tab) return false;
      if (from && r.start_date && r.start_date < from) return false;
      if (to && r.start_date && r.start_date > to) return false;
      return true;
    });
  }, [rows, q, tab, from, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const submitForApproval = async (id: string) => {
    const { error } = await supabase.from("plans").update({ status: "pending" }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Đã gửi duyệt"); qc.invalidateQueries({ queryKey: ["plans", orgId] }); }
  };

  const stats = [
    { key: "all", label: "Tổng kế hoạch", value: counts.all, sub: "Danh sách hiện có", icon: FileText, color: "text-slate-700" },
    { key: "pending_survey", label: "Chờ khảo sát", value: counts.pending_survey, sub: "Đang thu thập khảo sát", icon: Hourglass, color: "text-amber-600" },
    { key: "pending", label: "Đang chờ duyệt", value: counts.pending, sub: "Chờ quyết định", icon: Clock, color: "text-blue-600" },
    { key: "approved", label: "Đã duyệt", value: counts.approved, sub: "Hoàn tất phê duyệt", icon: CheckCircle2, color: "text-emerald-600" },
    { key: "rejected", label: "Bị từ chối", value: counts.rejected, sub: "Cần chỉnh sửa", icon: XCircle, color: "text-red-600" },
  ];

  return (
    <PageContainer
      title="Kế hoạch đào tạo"
      breadcrumbs={[{ title: "Kế hoạch đào tạo" }]}
    >
      {/* Top filter bar */}
      <Card className="p-4 mb-4">
        <div className="grid gap-3 md:grid-cols-[1fr_200px_200px_auto] items-end">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Tìm kiếm..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Từ ngày</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Đến ngày</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to="/admin/plans/new"><Plus className="mr-1 h-4 w-4" />Tạo kế hoạch</Link>
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => {
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              onClick={() => { setTab(t.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {t.label} ({counts[t.value] ?? 0})
            </button>
          );
        })}
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 md:grid-cols-5 mb-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const active = tab === s.key;
          return (
            <button key={s.key} onClick={() => { setTab(s.key); setPage(1); }}
              className={`text-left rounded-lg border bg-white p-4 transition hover:shadow-md ${active ? "ring-2 ring-blue-500 border-blue-300" : "border-slate-200"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600">{s.label}</span>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-400 mt-1">{s.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">STT</TableHead>
              <TableHead>Tên kế hoạch</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Ngân sách</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
              ))
            ) : pageRows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-12">Không có kế hoạch nào</TableCell></TableRow>
            ) : (
              pageRows.map((r, idx) => (
                <PlanRow
                  key={r.id}
                  index={(page - 1) * pageSize + idx + 1}
                  row={r}
                  onDelete={() => m.remove.mutateAsync(r.id)}
                  onSubmit={() => submitForApproval(r.id)}
                  onEdit={() => nav({ to: "/admin/plans/$id/edit", params: { id: r.id } })}
                />
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-3 border-t text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span>Số hàng mỗi trang:</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[80px] h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span>{filtered.length === 0 ? "0" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)}`} trong {filtered.length}</span>
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}

function PlanRow({ index, row, onDelete, onSubmit, onEdit }: { index: number; row: DBPlan; onDelete: () => Promise<unknown>; onSubmit: () => void; onEdit: () => void; }) {
  const [confirm, setConfirm] = useState(false);
  const status = PLAN_STATUS_BADGE[row.status];
  const canEdit = true;
  const canDelete = true;
  const canSubmit = row.status === "draft";
  const hasTime = row.start_date && row.end_date;
  return (
    <TableRow>
      <TableCell className="text-slate-500">{index}</TableCell>
      <TableCell className="font-medium">
        <Link to="/admin/plans/$id" params={{ id: row.id }} className="hover:underline text-slate-900">{row.title}</Link>
      </TableCell>
      <TableCell className="text-sm text-slate-600">
        {hasTime ? <span>00:00 | {fmt(row.start_date)} → 00:00 | {fmt(row.end_date)}</span> : <span className="text-slate-400">Chưa có</span>}
      </TableCell>
      <TableCell className="text-sm">
        {row.budget && Number(row.budget) > 0 ? <span>{Number(row.budget).toLocaleString("vi-VN")} ₫</span> : <span className="text-slate-400">—</span>}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className={status.cls}>{status.label}</Badge>
          {row.status === "pending" && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Khảo sát xong</Badge>}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/admin/plans/$id" params={{ id: row.id }}><Eye className="h-4 w-4 mr-2" />Xem chi tiết</Link>
            </DropdownMenuItem>
            {canEdit && <DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4 mr-2" />Chỉnh sửa</DropdownMenuItem>}
            {canSubmit && <DropdownMenuItem onClick={onSubmit}><Send className="h-4 w-4 mr-2" />Gửi duyệt</DropdownMenuItem>}
            {canDelete && <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setConfirm(true)} className="text-red-600 focus:text-red-700"><Trash2 className="h-4 w-4 mr-2" />Xoá</DropdownMenuItem>
            </>}
          </DropdownMenuContent>
        </DropdownMenu>
        <ConfirmDelete open={confirm} onOpenChange={setConfirm} onConfirm={async () => { await onDelete(); setConfirm(false); }} description={`Xoá kế hoạch "${row.title}"?`} />
      </TableCell>
    </TableRow>
  );
}

function fmt(d: string | null) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
