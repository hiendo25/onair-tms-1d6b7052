import { createFileRoute } from "@tanstack/react-router";
import { useClassrooms, useClassroomMutations, type DBClassroom } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";
import { classroomSchema, type ClassroomForm } from "@/lib/admin-schemas";
import { CLASSROOM_TYPE, CLASSROOM_STATUS, CODE_NOTE } from "@/lib/admin-options";
import type { FieldDef } from "@/components/admin/EntityFormDialog";

export const Route = createFileRoute("/_app/admin/class-room")({
  head: () => ({ meta: [{ title: "Lớp học — OnAir TMS" }] }),
  component: ClassroomPage,
});

const formFields: FieldDef<ClassroomForm>[] = [
  { name: "title", label: "Tên lớp học", type: "text", required: true, placeholder: "VD: Khoá Excel cơ bản tháng 6" },
  { name: "code", label: "Mã lớp", type: "text", required: true, placeholder: "VD: EXL-06", note: CODE_NOTE },
  { name: "description", label: "Mô tả", type: "textarea", placeholder: "Mục tiêu, đối tượng học viên...", rows: 3 },
  { name: "instructor", label: "Giảng viên phụ trách", type: "text", placeholder: "Họ tên giảng viên" },
  { name: "type", label: "Hình thức tổ chức", type: "select", required: true, options: CLASSROOM_TYPE },
  { name: "location", label: "Địa điểm", type: "text", placeholder: "Phòng học hoặc link tham dự" },
  { name: "capacity", label: "Sức chứa (số học viên tối đa)", type: "number" },
  { name: "start_date", label: "Ngày bắt đầu", type: "date" },
  { name: "end_date", label: "Ngày kết thúc", type: "date" },
  { name: "status", label: "Trạng thái", type: "select", required: true, options: CLASSROOM_STATUS },
];
const empty: Partial<DBClassroom> = { code: "", title: "", description: "", instructor: "", location: "", capacity: 0, students_count: 0, start_date: "", end_date: "", type: "offline", status: "upcoming" };

function ClassroomPage() {
  const { data: rows = [], isLoading } = useClassrooms();
  const m = useClassroomMutations();
  return (
    <SimpleEntityPage<DBClassroom>
      title="Quản lý lớp học"
      breadcrumbs={[{ title: "Đào tạo" }, { title: "Lớp học" }]}
      rows={rows} isLoading={isLoading}
      searchKeys={["title", "code", "instructor", "location"]}
      filters={[
        { key: "type", placeholder: "Hình thức", options: CLASSROOM_TYPE, match: (r, v) => r.type === v },
        { key: "status", placeholder: "Trạng thái", options: CLASSROOM_STATUS, match: (r, v) => r.status === v },
      ]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên lớp" }, { key: "instructor", label: "Giảng viên" },
        { key: "location", label: "Địa điểm" }, { key: "students_count", label: "HV" }, { key: "capacity", label: "Sức chứa" },
        { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[]}
      schema={classroomSchema}
      formFields={formFields}
      entityLabel="lớp học"
      emptyValues={empty}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, capacity: Number(r.capacity) || 0, students_count: 0, type: r.type || "offline", status: r.status || "upcoming" })))}
      csvFilename="classrooms.csv"
    />
  );
}
