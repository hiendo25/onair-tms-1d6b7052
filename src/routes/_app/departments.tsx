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
import { useDepartments, useDepartmentMutations, useBranches, useEmployees, type DBDepartment } from "@/lib/data-hooks";
import { RowActions } from "@/components/admin/RowActions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { ImportCsvDialog } from "@/components/admin/ImportCsvDialog";
import { EntityFormDialog, type FieldDef } from "@/components/admin/EntityFormDialog";
import { departmentSchema, type DepartmentForm } from "@/lib/admin-schemas";
import { CODE_NOTE, STATUS_ACTIVE_INACTIVE } from "@/lib/admin-options";
import { exportCsv } from "@/lib/csv";

export const Route = createFileRoute("/_app/departments")({
  head: () => ({ meta: [{ title: "Phòng ban — OnAir TMS" }] }),
  component: DepartmentsPage,
});

const PAGE_SIZE = 10;
const defaults: DepartmentForm = { code: "", name: "", branch: "", head: "", status: "active" };

function DepartmentsPage() {
  const { data: departments = [], isLoading } = useDepartments();
  const { data: branches = [] } = useBranches();
  const { data: employees = [] } = useEmployees();
  const { create, update, remove, bulkInsert } = useDepartmentMutations();
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<DBDepartment | null>(null);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const fields: FieldDef<DepartmentForm>[] = useMemo(() => [
    { name: "name", label: "Tên phòng ban", type: "text", required: true, placeholder: "Tên phòng ban" },
    { name: "code", label: "Mã phòng ban", type: "text", required: true, placeholder: "VD: HR-01", note: CODE_NOTE },
    {
      name: "branch", label: "Chi nhánh", type: "select", required: true, placeholder: "Chọn chi nhánh",
      options: branches.map((b) => ({ value: b.name, label: b.name })),
    },
    {
      name: "head", label: "Người quản lý", type: "select", placeholder: "Chọn người quản lý",
      options: [{ value: "", label: "— Chưa chọn —" }, ...employees.map((e) => ({ value: e.name, label: e.name }))],
    },
    { name: "status", label: "Trạng thái", type: "select", required: true, options: STATUS_ACTIVE_INACTIVE },
  ], [branches, employees]);

  const filtered = useMemo(() => departments.filter((d) => {
    const m = !q || [d.name, d.code, d.head].some((x) => x?.toLowerCase().includes(q.toLowerCase()));
    const b = branch === "all" || d.branch === branch;
    const s = status === "all" || d.status === status;
    return m && b && s;
  }), [departments, q, branch, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const submit = async (v: DepartmentForm) => {
    if (editing?.id) await update.mutateAsync({ ...v, id: editing.id, employees: editing.employees } as DBDepartment);
    else await create.mutateAsync({ ...v, employees: 0 });
  };

  return (
    <PageContainer
      title="Quản lý phòng ban"
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Phòng ban" }]}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setImporting(true)}><Upload className="h-4 w-4" />Import</Button>
          <Button size="sm" variant="outline" onClick={() => exportCsv("departments.csv", departments)}><Download className="h-4 w-4" />Export</Button>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }} disabled={branches.length === 0}>
            <Plus className="h-4 w-4" />Tạo phòng ban
          </Button>
        </div>
      }
    >
      <Card className="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Tìm tên, mã, người quản lý..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          <Select value={branch} onValueChange={(v) => { setBranch(v); setPage(1); }}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              {branches.map((b) => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
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
              <TableHead>Tên phòng ban</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Chi nhánh</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Người quản lý</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Đang tải...</TableCell></TableRow>}
            {!isLoading && pageRows.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Không có dữ liệu</TableCell></TableRow>}
            {pageRows.map((d, i) => (
              <TableRow key={d.id}>
                <TableCell className="text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell><Badge variant="outline">{d.code}</Badge></TableCell>
                <TableCell>{d.branch || "-"}</TableCell>
                <TableCell>
                  <Badge className={d.status === "active" ? "bg-emerald-500" : "bg-muted text-muted-foreground"}>
                    {d.status === "active" ? "Hoạt động" : "Ngưng hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell>{d.head || "-"}</TableCell>
                <TableCell><RowActions onEdit={() => { setEditing(d); setOpen(true); }} onDelete={() => setDelId(d.id)} /></TableCell>
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

      <EntityFormDialog<DepartmentForm>
        open={open} onOpenChange={setOpen}
        title={editing ? "Cập nhật phòng ban" : "Tạo phòng ban"}
        schema={departmentSchema} fields={fields} defaultValues={defaults}
        initialValues={editing ? { code: editing.code, name: editing.name, branch: editing.branch, head: editing.head, status: (editing.status as "active" | "inactive") || "active" } : undefined}
        onSubmit={submit} submitting={create.isPending || update.isPending}
      />

      <ConfirmDelete open={!!delId} onOpenChange={(v) => !v && setDelId(null)} onConfirm={async () => { if (delId) { await remove.mutateAsync(delId); setDelId(null); } }} />

      <ImportCsvDialog
        open={importing} onOpenChange={setImporting}
        title="Import phòng ban từ CSV"
        sampleHeaders={["code", "name", "branch", "head", "status"]}
        onImport={async (rows) => {
          await bulkInsert.mutateAsync(rows.map((r) => ({
            code: r.code, name: r.name, branch: r.branch ?? "", head: r.head ?? "",
            status: r.status || "active", employees: Number(r.employees) || 0,
          })));
        }}
      />
    </PageContainer>
  );
}
