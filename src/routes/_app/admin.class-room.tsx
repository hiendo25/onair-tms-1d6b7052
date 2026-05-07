import { createFileRoute } from "@tanstack/react-router";
import { useClassrooms, useClassroomMutations, type DBClassroom } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/class-room")({
  head: () => ({ meta: [{ title: "Lớp học — OnAir TMS" }] }),
  component: ClassroomPage,
});

const TYPE = [{ value: "offline", label: "Offline" }, { value: "online", label: "Online" }, { value: "hybrid", label: "Hybrid" }];
const STATUS = [{ value: "upcoming", label: "Sắp diễn ra" }, { value: "active", label: "Đang diễn ra" }, { value: "completed", label: "Hoàn thành" }];

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
        { key: "type", placeholder: "Loại", options: TYPE, match: (r, v) => r.type === v },
        { key: "status", placeholder: "Trạng thái", options: STATUS, match: (r, v) => r.status === v },
      ]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên lớp" }, { key: "instructor", label: "Giảng viên" },
        { key: "location", label: "Địa điểm" }, { key: "students_count", label: "HV" }, { key: "capacity", label: "Sức chứa" },
        { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[
        { key: "code", label: "Mã" }, { key: "title", label: "Tên" }, { key: "description", label: "Mô tả", type: "textarea" },
        { key: "instructor", label: "Giảng viên" }, { key: "location", label: "Địa điểm" },
        { key: "capacity", label: "Sức chứa", type: "number" },
        { key: "start_date", label: "Bắt đầu", type: "date" }, { key: "end_date", label: "Kết thúc", type: "date" },
        { key: "type", label: "Loại", type: "select", options: TYPE }, { key: "status", label: "Trạng thái", type: "select", options: STATUS },
      ]}
      emptyValues={{ code: "", title: "", description: "", instructor: "", location: "", capacity: 0, students_count: 0, type: "offline", status: "upcoming" }}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, capacity: Number(r.capacity) || 0, students_count: 0, type: r.type || "offline", status: r.status || "upcoming" })))}
      csvFilename="classrooms.csv"
    />
  );
}
