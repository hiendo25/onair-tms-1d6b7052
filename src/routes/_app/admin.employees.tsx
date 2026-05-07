import { createFileRoute } from "@tanstack/react-router";
import { useEmployees, useEmployeeMutations, useBranches, useDepartments, useRoles, type DBEmployee } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_app/admin/employees")({
  head: () => ({ meta: [{ title: "Quản lý nhân viên — OnAir TMS" }] }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const { data: rows = [], isLoading } = useEmployees();
  const { data: branches = [] } = useBranches();
  const { data: departments = [] } = useDepartments();
  const { data: roles = [] } = useRoles();
  const m = useEmployeeMutations();

  const branchOpts = branches.map((b) => ({ value: b.name, label: b.name }));
  const deptOpts = departments.map((d) => ({ value: d.name, label: d.name }));
  const roleOpts = roles.map((r) => ({ value: r.name, label: r.name }));

  return (
    <SimpleEntityPage<DBEmployee>
      title="Danh sách nhân viên"
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Nhân viên" }]}
      rows={rows} isLoading={isLoading}
      searchKeys={["name", "email", "employee_code", "phone"]}
      filters={[
        { key: "branch", placeholder: "Chi nhánh", options: branchOpts, match: (r, v) => r.branch === v },
        { key: "department", placeholder: "Phòng ban", options: deptOpts, match: (r, v) => r.department === v },
        { key: "role", placeholder: "Vai trò", options: roleOpts, match: (r, v) => r.role === v },
        { key: "status", placeholder: "Trạng thái", options: [{ value: "active", label: "Hoạt động" }, { value: "inactive", label: "Ngưng" }], match: (r, v) => r.status === v },
      ]}
      columns={[
        { key: "employee_code", label: "Mã" },
        { key: "name", label: "Họ tên", render: (r) => (
          <div className="flex items-center gap-2"><Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{r.name.split(" ").slice(-2).map((n) => n[0]).join("")}</AvatarFallback></Avatar><span className="font-medium">{r.name}</span></div>
        )},
        { key: "email", label: "Email" },
        { key: "branch", label: "Chi nhánh" },
        { key: "department", label: "Phòng ban" },
        { key: "position", label: "Chức vụ" },
        { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[
        { key: "employee_code", label: "Mã NV" },
        { key: "name", label: "Họ tên" },
        { key: "email", label: "Email" },
        { key: "phone", label: "SĐT" },
        { key: "branch", label: "Chi nhánh", type: "select", options: branchOpts },
        { key: "department", label: "Phòng ban", type: "select", options: deptOpts },
        { key: "role", label: "Vai trò", type: "select", options: roleOpts },
        { key: "position", label: "Chức vụ" },
        { key: "type", label: "Loại", type: "select", options: [{ value: "fulltime", label: "Toàn thời gian" }, { value: "parttime", label: "Bán thời gian" }] },
        { key: "status", label: "Trạng thái", type: "select", options: [{ value: "active", label: "Hoạt động" }, { value: "inactive", label: "Ngưng" }] },
      ]}
      emptyValues={{ employee_code: "", name: "", email: "", phone: "", branch: "", department: "", role: "", position: "", type: "fulltime", status: "active", avatar_url: "" }}
      onCreate={(v) => m.create.mutateAsync(v)}
      onUpdate={(v) => m.update.mutateAsync(v)}
      onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rows) => m.bulkInsert.mutateAsync(rows.map((r: any) => ({ ...r, type: r.type || "fulltime", status: r.status || "active", avatar_url: "" })))}
      csvFilename="employees.csv"
      csvHeaders={["employee_code", "name", "email", "phone", "branch", "department", "role", "position", "type", "status"]}
    />
  );
}
