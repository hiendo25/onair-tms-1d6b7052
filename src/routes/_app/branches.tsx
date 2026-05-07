import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Upload, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBranches, useBranchMutations, useEmployees, type DBBranch } from "@/lib/data-hooks";
import { RowActions } from "@/components/admin/RowActions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { ImportCsvDialog } from "@/components/admin/ImportCsvDialog";
import { EntityFormDialog, type FieldDef } from "@/components/admin/EntityFormDialog";
import { branchSchema, type BranchForm } from "@/lib/admin-schemas";
import { STATUS_ACTIVE_INACTIVE, CODE_NOTE } from "@/lib/admin-options";
import { exportCsv } from "@/lib/csv";

export const Route = createFileRoute("/_app/branches")({
  head: () => ({ meta: [{ title: "Chi nhánh — OnAir TMS" }] }),
  component: BranchesPage,
});

const PAGE_SIZE = 10;
const defaults: BranchForm = { code: "", name: "", manager: "", phone: "", address: "", status: "active" };

function BranchesPage() {
  const { data: branches = [], isLoading } = useBranches();
  const { data: employees = [] } = useEmployees();
  const { create, update, remove, bulkInsert } = useBranchMutations();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<DBBranch | null>(null);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const filtered = useMemo(() => branches.filter((b) => {
    const m = !q || [b.name, b.code, b.address, b.manager].some((x) => x?.toLowerCase().includes(q.toLowerCase()));
    const s = status === "all" || b.status === status;
    return m && s;
  }), [branches, q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fields: FieldDef<BranchForm>[] = useMemo(() => [
    { name: "name", label: "Tên chi nhánh", type: "text", required: true, placeholder: "Tên chi nhánh" },
    { name: "code", label: "Mã chi nhánh", type: "text", required: true, placeholder: "VD: HCM-01", note: CODE_NOTE },
    {
      name: "manager",
      label: "Người quản lý",
      type: "select",
      placeholder: "Chọn người quản lý",
      options: [{ value: "__none__", label: "— Chưa chọn —" }, ...employees.map((e) => ({ value: e.name, label: e.name }))],
    },
    { name: "phone", label: "Số điện thoại", type: "tel", placeholder: "VD: 0901234567" },
    { name: "address", label: "Địa chỉ", type: "textarea", placeholder: "Địa chỉ chi nhánh", rows: 2 },
    { name: "status", label: "Trạng thái", type: "select", required: true, options: STATUS_ACTIVE_INACTIVE },
  ], [employees]);

  const submit = async (v: BranchForm) => {
    const payload = { ...v, manager: v.manager === "__none__" ? "" : v.manager };
    if (editing?.id) await update.mutateAsync({ ...payload, id: editing.id, employees: editing.employees } as DBBranch);
    else await create.mutateAsync({ ...payload, employees: 0 });
  };

  return (
    <PageContainer
      title="Quản lý chi nhánh"
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Chi nhánh" }]}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setImporting(true)}><Upload className="h-4 w-4" />Import</Button>
          <Button size="sm" variant="outline" onClick={() => exportCsv("branches.csv", branches)}><Download className="h-4 w-4" />Export</Button>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Tạo chi nhánh</Button>
        </div>
      }
    >
      <Card className="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Tìm theo tên, mã, địa chỉ, quản lý..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Ngưng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">STT</TableHead>
              <TableHead>Tên chi nhánh</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Địa điểm</TableHead>
              <TableHead>Người quản lý</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Đang tải...</TableCell></TableRow>}
            {!isLoading && pageRows.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Không có dữ liệu</TableCell></TableRow>}
            {pageRows.map((b, i) => (
              <TableRow key={b.id}>
                <TableCell className="text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell><Badge variant="outline">{b.code}</Badge></TableCell>
                <TableCell>
                  <Badge className={b.status === "active" ? "bg-emerald-500" : "bg-muted text-muted-foreground"}>
                    {b.status === "active" ? "Hoạt động" : "Ngưng hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell>{b.address || "-"}</TableCell>
                <TableCell>{b.manager || "-"}</TableCell>
                <TableCell><RowActions onEdit={() => { setEditing(b); setOpen(true); }} onDelete={() => setDelId(b.id)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Hiển thị {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}</span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="px-3">Trang {page}/{totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </Card>

      <EntityFormDialog<BranchForm>
        open={open} onOpenChange={setOpen}
        title={editing ? "Cập nhật chi nhánh" : "Tạo chi nhánh"}
        schema={branchSchema} fields={fields} defaultValues={defaults}
        initialValues={editing ? { code: editing.code, name: editing.name, address: editing.address, phone: editing.phone, manager: editing.manager, status: editing.status as "active" | "inactive" } : undefined}
        onSubmit={submit} submitting={create.isPending || update.isPending}
      />

      <ConfirmDelete open={!!delId} onOpenChange={(v) => !v && setDelId(null)} onConfirm={async () => { if (delId) { await remove.mutateAsync(delId); setDelId(null); } }} />

      <ImportCsvDialog
        open={importing} onOpenChange={setImporting}
        title="Import chi nhánh từ CSV"
        sampleHeaders={["code", "name", "address", "phone", "manager", "status"]}
        onImport={async (rows) => {
          const byCode = new Map(branches.map((b) => [b.code, b]));
          const toUpdate: { existing: DBBranch; row: typeof rows[number] }[] = [];
          const toInsert: typeof rows = [];
          for (const r of rows) {
            if (!r.code) continue;
            const existing = byCode.get(r.code);
            if (existing) toUpdate.push({ existing, row: r });
            else toInsert.push(r);
          }
          for (const { existing, row: r } of toUpdate) {
            await update.mutateAsync({
              id: existing.id,
              code: r.code,
              name: r.name ?? existing.name,
              address: r.address ?? existing.address,
              phone: r.phone ?? existing.phone,
              manager: r.manager ?? existing.manager,
              status: r.status || existing.status,
              employees: Number(r.employees) || existing.employees,
            } as DBBranch);
          }
          if (toInsert.length) {
            await bulkInsert.mutateAsync(toInsert.map((r) => ({
              code: r.code, name: r.name, address: r.address ?? "", phone: r.phone ?? "",
              manager: r.manager ?? "", status: r.status || "active", employees: Number(r.employees) || 0,
            })));
          }
        }}
      />
    </PageContainer>
  );
}
