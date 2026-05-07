import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Upload, Download } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDepartments, useDepartmentMutations, useBranches, type DBDepartment } from "@/lib/data-hooks";
import { RowActions } from "@/components/admin/RowActions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { ImportCsvDialog } from "@/components/admin/ImportCsvDialog";
import { EntityFormDialog, type FieldDef } from "@/components/admin/EntityFormDialog";
import { departmentSchema, type DepartmentForm } from "@/lib/admin-schemas";
import { CODE_NOTE } from "@/lib/admin-options";
import { exportCsv } from "@/lib/csv";

export const Route = createFileRoute("/_app/departments")({
  head: () => ({ meta: [{ title: "Phòng ban — OnAir TMS" }] }),
  component: DepartmentsPage,
});

const defaults: DepartmentForm = { code: "", name: "", branch: "", head: "" };

function DepartmentsPage() {
  const { data: departments = [], isLoading } = useDepartments();
  const { data: branches = [] } = useBranches();
  const { create, update, remove, bulkInsert } = useDepartmentMutations();
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState("all");
  const [editing, setEditing] = useState<DBDepartment | null>(null);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const fields: FieldDef<DepartmentForm>[] = [
    { name: "name", label: "Tên phòng ban", type: "text", required: true, placeholder: "Tên phòng ban" },
    { name: "code", label: "Mã phòng ban", type: "text", required: true, placeholder: "VD: HR-01", note: CODE_NOTE },
    { name: "branch", label: "Chi nhánh", type: "select", placeholder: "Chọn chi nhánh", options: branches.map((b) => ({ value: b.name, label: b.name })) },
    { name: "head", label: "Trưởng phòng", type: "text", placeholder: "Họ tên trưởng phòng" },
  ];

  const filtered = useMemo(() => departments.filter((d) => {
    const m = !q || [d.name, d.code, d.head].some((x) => x?.toLowerCase().includes(q.toLowerCase()));
    const b = branch === "all" || d.branch === branch;
    return m && b;
  }), [departments, q, branch]);

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
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Thêm phòng ban</Button>
        </div>
      }
    >
      <Card className="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Tìm tên, mã, trưởng phòng..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={branch} onValueChange={setBranch}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              {branches.map((b) => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên phòng ban</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Chi nhánh</TableHead>
              <TableHead>Trưởng phòng</TableHead>
              <TableHead>NV</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Đang tải...</TableCell></TableRow>}
            {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Không có dữ liệu</TableCell></TableRow>}
            {filtered.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell><Badge variant="outline">{d.code}</Badge></TableCell>
                <TableCell>{d.branch || "-"}</TableCell>
                <TableCell>{d.head || "-"}</TableCell>
                <TableCell>{d.employees}</TableCell>
                <TableCell><RowActions onEdit={() => { setEditing(d); setOpen(true); }} onDelete={() => setDelId(d.id)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <EntityFormDialog<DepartmentForm>
        open={open} onOpenChange={setOpen}
        title={editing ? "Sửa phòng ban" : "Thêm phòng ban"}
        schema={departmentSchema} fields={fields} defaultValues={defaults}
        initialValues={editing ? { code: editing.code, name: editing.name, branch: editing.branch, head: editing.head } : undefined}
        onSubmit={submit} submitting={create.isPending || update.isPending}
      />

      <ConfirmDelete open={!!delId} onOpenChange={(v) => !v && setDelId(null)} onConfirm={async () => { if (delId) { await remove.mutateAsync(delId); setDelId(null); } }} />

      <ImportCsvDialog
        open={importing} onOpenChange={setImporting}
        title="Import phòng ban từ CSV"
        sampleHeaders={["code", "name", "branch", "head"]}
        onImport={async (rows) => {
          await bulkInsert.mutateAsync(rows.map((r) => ({
            code: r.code, name: r.name, branch: r.branch ?? "", head: r.head ?? "", employees: Number(r.employees) || 0,
          })));
        }}
      />
    </PageContainer>
  );
}
