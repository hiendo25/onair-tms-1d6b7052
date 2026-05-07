import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2, Send } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { usePlans, usePlanMutations, type DBPlan } from "@/lib/data-hooks";
import { PLAN_STATUS, PLAN_TYPE } from "@/lib/admin-options";
import { PLAN_STATUS_BADGE } from "@/lib/plan-helpers";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useOrg } from "@/lib/org-context";

export const Route = createFileRoute("/_app/admin/plans")({
  head: () => ({ meta: [{ title: "Kế hoạch đào tạo — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { data: rows = [], isLoading } = usePlans();
  const m = usePlanMutations();
  const qc = useQueryClient();
  const { orgId } = useOrg();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (q && !r.title.toLowerCase().includes(q.toLowerCase()) && !r.code.toLowerCase().includes(q.toLowerCase())) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (from && r.start_date && r.start_date < from) return false;
      if (to && r.start_date && r.start_date > to) return false;
      return true;
    });
  }, [rows, q, statusFilter, typeFilter, from, to]);

  const submitForApproval = async (id: string) => {
    const { error } = await supabase.from("plans").update({ status: "pending" }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Đã gửi duyệt"); qc.invalidateQueries({ queryKey: ["plans", orgId] }); }
  };

  return (
    <PageContainer
      title="Quản lý kế hoạch đào tạo"
      breadcrumbs={[{ title: "Quản lý" }, { title: "Kế hoạch đào tạo" }]}
      actions={
        <Button asChild><Link to="/admin/plans/new"><Plus className="mr-1 h-4 w-4" />Tạo kế hoạch</Link></Button>
      }
    >
      <Card className="p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Tìm theo tên hoặc mã..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {PLAN_STATUS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger><SelectValue placeholder="Loại" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              {PLAN_TYPE.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên kế hoạch</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>{[...Array(7)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-slate-500 py-8">Chưa có kế hoạch nào</TableCell></TableRow>
            ) : (
              filtered.map((r) => <PlanRow key={r.id} row={r} onDelete={() => m.remove.mutateAsync(r.id)} onSubmit={() => submitForApproval(r.id)} onEdit={() => nav({ to: "/admin/plans/$id/edit", params: { id: r.id } })} />)
            )}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}

function PlanRow({ row, onDelete, onSubmit, onEdit }: { row: DBPlan; onDelete: () => Promise<unknown>; onSubmit: () => void; onEdit: () => void; }) {
  const [confirm, setConfirm] = useState(false);
  const status = PLAN_STATUS_BADGE[row.status];
  const canEdit = row.status === "draft" || row.status === "rejected";
  const canDelete = row.status === "draft" || row.status === "rejected";
  const canSubmit = row.status === "draft";
  const typeLabel = PLAN_TYPE.find((t) => t.value === row.type)?.label ?? row.type;
  return (
    <TableRow>
      <TableCell><Badge variant="outline">{row.code}</Badge></TableCell>
      <TableCell className="font-medium"><Link to="/admin/plans/$id" params={{ id: row.id }} className="hover:underline">{row.title}</Link></TableCell>
      <TableCell>{typeLabel}</TableCell>
      <TableCell className="text-sm text-slate-600">{row.start_date ?? "—"} → {row.end_date ?? "—"}</TableCell>
      <TableCell className="text-sm text-slate-600">{new Date(row.created_at).toLocaleDateString("vi-VN")}</TableCell>
      <TableCell><Badge variant="outline" className={status.cls}>{status.label}</Badge></TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="icon" title="Xem chi tiết"><Link to="/admin/plans/$id" params={{ id: row.id }}><Eye className="h-4 w-4" /></Link></Button>
          {canEdit && <Button variant="ghost" size="icon" onClick={onEdit} title="Chỉnh sửa"><Pencil className="h-4 w-4" /></Button>}
          {canSubmit && <Button variant="ghost" size="icon" onClick={onSubmit} title="Gửi duyệt"><Send className="h-4 w-4" /></Button>}
          {canDelete && <Button variant="ghost" size="icon" onClick={() => setConfirm(true)} title="Xoá"><Trash2 className="h-4 w-4 text-red-600" /></Button>}
        </div>
        <ConfirmDelete open={confirm} onOpenChange={setConfirm} onConfirm={async () => { await onDelete(); setConfirm(false); }} description={`Xoá kế hoạch "${row.title}"?`} />
      </TableCell>
    </TableRow>
  );
}
