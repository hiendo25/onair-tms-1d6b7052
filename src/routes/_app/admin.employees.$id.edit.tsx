import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEmployees, useEmployeeMutations, useBranches, useDepartments, useRoles } from "@/lib/data-hooks";
import { employeeSchema, type EmployeeForm } from "@/lib/admin-schemas";
import { EMPLOYEE_TYPE, STATUS_ACTIVE_INACTIVE } from "@/lib/admin-options";

export const Route = createFileRoute("/_app/admin/employees/$id/edit")({
  head: () => ({ meta: [{ title: "Chỉnh sửa nhân viên — OnAir TMS" }] }),
  component: EditEmp,
});

function EditEmp() {
  const { id } = Route.useParams();
  const nav = useNavigate();

  const { data: rows = [], isLoading } = useEmployees();
  const { data: branches = [] } = useBranches();
  const { data: departments = [] } = useDepartments();
  const { data: roles = [] } = useRoles();
  const m = useEmployeeMutations();

  const emp = rows.find((r) => r.id === id);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } =
    useForm<EmployeeForm>({ resolver: zodResolver(employeeSchema) });

  useEffect(() => {
    if (emp) {
      reset({
        name: emp.name ?? "",
        email: emp.email ?? "",
        phone: emp.phone ?? "",
        employee_code: emp.employee_code ?? "",
        branch: emp.branch ?? "",
        department: emp.department ?? "",
        role: emp.role ?? "",
        position: emp.position ?? "",
        type: (emp.type as EmployeeForm["type"]) ?? "fulltime",
        status: (emp.status as EmployeeForm["status"]) ?? "active",
        joined_at: emp.joined_at ?? "",
      });
    }
  }, [emp, reset]);

  const branchVal = watch("branch");
  const deptOpts = useMemo(
    () => departments.filter((d) => !branchVal || d.branch === branchVal),
    [departments, branchVal],
  );

  async function onSubmit(data: EmployeeForm) {
    await m.update.mutateAsync({ id, ...data });
    toast.success("Đã cập nhật nhân viên");
    nav({ to: "/admin/employees" });
  }

  if (isLoading) {
    return (
      <PageContainer title="Chỉnh sửa nhân viên" breadcrumbs={[{ title: "Nhân viên", path: "/admin/employees" }, { title: "Chỉnh sửa" }]}>
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </PageContainer>
    );
  }

  if (!emp) {
    return (
      <PageContainer title="Không tìm thấy" breadcrumbs={[{ title: "Nhân viên", path: "/admin/employees" }]}>
        <p className="text-muted-foreground">Nhân viên không tồn tại.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Chỉnh sửa nhân viên"
      breadcrumbs={[{ title: "Nhân viên", path: "/admin/employees" }, { title: emp.name }, { title: "Chỉnh sửa" }]}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle>Thông tin cơ bản</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Họ và tên *</Label>
              <Input {...register("name")} placeholder="Nguyễn Văn A" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Email *</Label>
              <Input {...register("email")} type="email" placeholder="name@company.vn" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Số điện thoại</Label>
              <Input {...register("phone")} placeholder="0901234567" />
            </div>

            <div className="space-y-1">
              <Label>Mã nhân viên</Label>
              <Input {...register("employee_code")} placeholder="NV0001" />
            </div>

            <div className="space-y-1">
              <Label>Chi nhánh</Label>
              <Select value={watch("branch") ?? ""} onValueChange={(v) => setValue("branch", v)}>
                <SelectTrigger><SelectValue placeholder="Chọn chi nhánh" /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Phòng ban *</Label>
              <Select value={watch("department") ?? ""} onValueChange={(v) => setValue("department", v)}>
                <SelectTrigger><SelectValue placeholder="Chọn phòng ban" /></SelectTrigger>
                <SelectContent>
                  {deptOpts.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Vai trò</Label>
              <Select value={watch("role") ?? ""} onValueChange={(v) => setValue("role", v)}>
                <SelectTrigger><SelectValue placeholder="Chọn vai trò" /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Chức danh</Label>
              <Input {...register("position")} placeholder="Trưởng nhóm, Nhân viên..." />
            </div>

            <div className="space-y-1">
              <Label>Loại hợp đồng *</Label>
              <Select value={watch("type")} onValueChange={(v) => setValue("type", v as EmployeeForm["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_TYPE.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Ngày vào làm</Label>
              <Input {...register("joined_at")} type="date" />
            </div>

            <div className="space-y-1">
              <Label>Trạng thái *</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as EmployeeForm["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_ACTIVE_INACTIVE.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => nav({ to: "/admin/employees" })}>Hủy</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </PageContainer>
  );
}
