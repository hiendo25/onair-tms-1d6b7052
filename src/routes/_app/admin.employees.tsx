import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Upload, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEmployees, useEmployeeMutations, useBranches, useDepartments, useRoles, type DBEmployee } from "@/lib/data-hooks";
import { RowActions } from "@/components/admin/RowActions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { ImportCsvDialog } from "@/components/admin/ImportCsvDialog";
import { EntityFormDialog, type FieldDef } from "@/components/admin/EntityFormDialog";
import { employeeSchema, type EmployeeForm } from "@/lib/admin-schemas";
import { EMPLOYEE_TYPE, STATUS_ACTIVE_INACTIVE } from "@/lib/admin-options";
import { exportCsv } from "@/lib/csv";

export const Route = createFileRoute("/_app/admin/employees")({
  head: () => ({ meta: [{ title: "Quản lý nhân viên — OnAir TMS" }] }),
  component: EmployeesPage,
});

const empty: EmployeeForm = {
  employee_code: "", name: "", email: "", phone: "", branch: "", department: "",
  role: "", position: "", type: "fulltime", status: "active", joined_at: "",
};

const typeLabel: Record<string, string> = {
  fulltime: "Toàn thời gian", parttime: "Bán thời gian", intern: "Thực tập", contract: "Hợp đồng",
};

function EmployeesPage() {
  const { data: rows = [], isLoading } = useEmployees();
  const { data: branches = [] } = useBranches();
  const { data: departments = [] } = useDepartments();
  const { data: roles = [] } = useRoles();
  const m = useEmployeeMutations();

  const [q, setQ] = useState("");
  const [branch, setBranch] = useState("all");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<DBEmployee | null>(null);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const branchOpts = useMemo(() => branches.map((b) => ({ value: b.name, label: b.name })), [branches]);
  const deptOpts = useMemo(
    () => departments
      .filter((d) => branch === "all" || d.branch === branch)
      .map((d) => ({ value: d.name, label: d.name })),
    [departments, branch],
  );
  const roleOpts = useMemo(() => roles.map((r) => ({ value: r.name, label: r.name })), [roles]);

  const fields: FieldDef<EmployeeForm>[] = useMemo(() => [
    { name: "name", label: "Họ và tên", type: "text", required: true, placeholder: "VD: Nguyễn Văn A" },
    { name: "email", label: "Email", type: "email", required: true, placeholder: "name@company.vn" },
    { name: "phone", label: "Số điện thoại", type: "tel", placeholder: "10-11 chữ số" },
    { name: "employee_code", label: "Mã nhân viên", type: "text", placeholder: "VD: NV0001" },
    { name: "branch", label: "Chi nhánh", type: "select", options: branches.map((b) => ({ value: b.name, label: b.name })), placeholder: "Chọn chi nhánh" },
    { name: "department", label: "Phòng ban", type: "select", required: true, options: departments.map((d) => ({ value: d.name, label: d.name })), placeholder: "Chọn phòng ban" },
    { name: "role", label: "Vai trò", type: "select", options: roleOpts, placeholder: "Chọn vai trò" },
    { name: "position", label: "Chức danh", type: "text", placeholder: "VD: Trưởng nhóm" },
    { name: "type", label: "Loại người dùng", type: "select", required: true, options: EMPLOYEE_TYPE },
    { name: "joined_at", label: "Ngày vào làm", type: "date" },
    { name: "status", label: "Trạng thái", type: "select", required: true, options: STATUS_ACTIVE_INACTIVE },
  ], [branches, departments, roleOpts]);

  const filtered = useMemo(() => rows.filter((r) => {
    const t = q.toLowerCase();
    const m1 = !q || [r.name, r.email, r.employee_code, r.phone].some((x) => x?.toLowerCase().includes(t));
    return m1
      && (branch === "all" || r.branch === branch)
      && (department === "all" || r.department === department)
      && (status === "all" || r.status === status);
  }), [rows, q, branch, department, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const submit = async (v: EmployeeForm) => {
    const payload = { ...v, avatar_url: editing?.avatar_url ?? "", joined_at: v.joined_at || null };
    if (editing?.id) await m.update.mutateAsync({ ...payload, id: editing.id } as DBEmployee);
    else await m.create.mutateAsync(payload as Omit<DBEmployee, "id" | "org_id">);
  };

  return (
    <PageContainer
      title="Danh sách người dùng"
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Người dùng" }]}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setImporting(true)}><Upload className="h-4 w-4" />Import người dùng</Button>
          <Button size="sm" variant="outline" onClick={() => exportCsv("employees.csv", rows)}><Download className="h-4 w-4" />Export</Button>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Tạo người dùng</Button>
        </div>
      }
    >
      <Card className="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Tìm theo tên, email, mã, SĐT..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          <Select value={branch} onValueChange={(v) => { setBranch(v); setDepartment("all"); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Chi nhánh" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              {branchOpts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={department} onValueChange={(v) => { setDepartment(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Phòng ban" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng ban</SelectItem>
              {deptOpts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
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
              <TableHead>Mã</TableHead>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Chức danh</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead>Chi nhánh</TableHead>
              <TableHead>Loại người dùng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground">Đang tải...</TableCell></TableRow>}
            {!isLoading && pageRows.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground">Không có dữ liệu</TableCell></TableRow>}
            {pageRows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.employee_code || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{r.name.split(" ").slice(-2).map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                    <span className="font-medium">{r.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{r.email || "-"}</TableCell>
                <TableCell>{r.position || "-"}</TableCell>
                <TableCell>{r.role || "-"}</TableCell>
                <TableCell>{r.department || "-"}</TableCell>
                <TableCell>{r.branch || "-"}</TableCell>
                <TableCell><Badge variant="outline">{typeLabel[r.type] ?? r.type}</Badge></TableCell>
                <TableCell>
                  <Badge className={r.status === "active" ? "bg-emerald-500" : "bg-muted text-muted-foreground"}>
                    {r.status === "active" ? "Hoạt động" : "Ngưng hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell><RowActions onEdit={() => { setEditing(r); setOpen(true); }} onDelete={() => setDelId(r.id)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Số hàng mỗi trang</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[80px] h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">
              {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} / {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="px-3">Trang {page}/{totalPages}</span>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>

      <EntityFormDialog<EmployeeForm>
        open={open} onOpenChange={setOpen}
        title={editing ? "Cập nhật người dùng" : "Tạo người dùng"}
        schema={employeeSchema} fields={fields} defaultValues={empty} size="lg"
        initialValues={editing ? {
          employee_code: editing.employee_code, name: editing.name, email: editing.email, phone: editing.phone,
          branch: editing.branch, department: editing.department, role: editing.role, position: editing.position,
          type: (editing.type as EmployeeForm["type"]) || "fulltime",
          status: (editing.status as EmployeeForm["status"]) || "active",
          joined_at: editing.joined_at ?? "",
        } : undefined}
        onSubmit={submit} submitting={m.create.isPending || m.update.isPending}
      />

      <ConfirmDelete open={!!delId} onOpenChange={(v) => !v && setDelId(null)} onConfirm={async () => { if (delId) { await m.remove.mutateAsync(delId); setDelId(null); } }} />

      <ImportCsvDialog
        open={importing} onOpenChange={setImporting}
        title="Import người dùng từ CSV"
        sampleHeaders={["employee_code", "name", "email", "phone", "branch", "department", "role", "position", "type", "status"]}
        onImport={async (rows) => {
          await m.bulkInsert.mutateAsync(rows.map((r) => ({
            employee_code: r.employee_code ?? "", name: r.name, email: r.email ?? "", phone: r.phone ?? "",
            branch: r.branch ?? "", department: r.department ?? "", role: r.role ?? "", position: r.position ?? "",
            type: r.type || "fulltime", status: r.status || "active", avatar_url: "", joined_at: r.joined_at || null,
          })));
        }}
      />
    </PageContainer>
  );
}
