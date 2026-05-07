import { createFileRoute } from "@tanstack/react-router";
import { useEmployees, useEmployeeMutations, useBranches, useDepartments, useRoles, type DBEmployee } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { employeeSchema, type EmployeeForm } from "@/lib/admin-schemas";
import { EMPLOYEE_TYPE, STATUS_ACTIVE_INACTIVE } from "@/lib/admin-options";
import type { FieldDef } from "@/components/admin/EntityFormDialog";

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

  const formFields: FieldDef<EmployeeForm>[] = [
    { name: "name", label: "Họ và tên", type: "text", required: true, placeholder: "VD: Nguyễn Văn A" },
    { name: "email", label: "Email", type: "email", required: true, placeholder: "name@company.vn" },
    { name: "phone", label: "Số điện thoại", type: "tel", placeholder: "10-11 chữ số" },
    { name: "employee_code", label: "Mã nhân viên", type: "text", placeholder: "VD: NV0001" },
    { name: "branch", label: "Chi nhánh", type: "select", options: branchOpts, placeholder: "Chọn chi nhánh" },
    { name: "department", label: "Phòng ban", type: "select", required: true, options: deptOpts, placeholder: "Chọn phòng ban" },
    { name: "role", label: "Vai trò", type: "select", options: roleOpts, placeholder: "Chọn vai trò" },
    { name: "position", label: "Chức vụ", type: "text", placeholder: "VD: Trưởng nhóm" },
    { name: "type", label: "Loại nhân sự", type: "select", required: true, options: EMPLOYEE_TYPE },
    { name: "joined_at", label: "Ngày vào làm", type: "date" },
    { name: "status", label: "Trạng thái", type: "select", required: true, options: STATUS_ACTIVE_INACTIVE },
  ];
  const empty: Partial<DBEmployee> = { employee_code: "", name: "", email: "", phone: "", branch: "", department: "", role: "", position: "", type: "fulltime", status: "active", avatar_url: "", joined_at: "" };

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
        { key: "status", placeholder: "Trạng thái", options: STATUS_ACTIVE_INACTIVE, match: (r, v) => r.status === v },
      ]}
      columns={[
        { key: "employee_code", label: "Mã NV" },
        { key: "name", label: "Họ tên", render: (r) => (
          <div className="flex items-center gap-2"><Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{r.name.split(" ").slice(-2).map((n) => n[0]).join("")}</AvatarFallback></Avatar><span className="font-medium">{r.name}</span></div>
        )},
        { key: "email", label: "Email" },
        { key: "branch", label: "Chi nhánh" },
        { key: "department", label: "Phòng ban" },
        { key: "position", label: "Chức vụ" },
        { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[]}
      schema={employeeSchema}
      formFields={formFields}
      entityLabel="nhân viên"
      emptyValues={empty}
      onCreate={(v) => m.create.mutateAsync(v)}
      onUpdate={(v) => m.update.mutateAsync(v)}
      onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rows) => m.bulkInsert.mutateAsync(rows.map((r: any) => ({ ...r, type: r.type || "fulltime", status: r.status || "active", avatar_url: "" })))}
      csvFilename="employees.csv"
      csvHeaders={["employee_code", "name", "email", "phone", "branch", "department", "role", "position", "type", "status"]}
    />
  );
}
