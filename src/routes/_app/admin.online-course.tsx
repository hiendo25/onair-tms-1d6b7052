import { createFileRoute } from "@tanstack/react-router";
import { useOnlineCourses, useOnlineCourseMutations, type DBOnlineCourse } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/online-course")({
  head: () => ({ meta: [{ title: "Khoá học online — OnAir TMS" }] }),
  component: OnlineCoursePage,
});

const STATUS = [{ value: "draft", label: "Nháp" }, { value: "published", label: "Đã xuất bản" }, { value: "inactive", label: "Ngưng" }];
const LEVEL = [{ value: "beginner", label: "Cơ bản" }, { value: "intermediate", label: "Trung cấp" }, { value: "advanced", label: "Nâng cao" }];

function OnlineCoursePage() {
  const { data: rows = [], isLoading } = useOnlineCourses();
  const m = useOnlineCourseMutations();
  const cats = Array.from(new Set(rows.map((r) => r.category).filter(Boolean))).map((c) => ({ value: c, label: c }));

  return (
    <SimpleEntityPage<DBOnlineCourse>
      title="Quản lý khoá học online"
      breadcrumbs={[{ title: "Đào tạo" }, { title: "Khoá học online" }]}
      rows={rows} isLoading={isLoading}
      searchKeys={["title", "code", "instructor", "category"]}
      filters={[
        { key: "status", placeholder: "Trạng thái", options: STATUS, match: (r, v) => r.status === v },
        { key: "level", placeholder: "Cấp độ", options: LEVEL, match: (r, v) => r.level === v },
        { key: "category", placeholder: "Danh mục", options: cats, match: (r, v) => r.category === v },
      ]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên khoá học" },
        { key: "category", label: "Danh mục" },
        { key: "level", label: "Cấp độ" },
        { key: "instructor", label: "Giảng viên" },
        { key: "lessons_count", label: "Bài" },
        { key: "students_count", label: "Học viên" },
        { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[
        { key: "code", label: "Mã" }, { key: "title", label: "Tên" }, { key: "description", label: "Mô tả", type: "textarea" },
        { key: "category", label: "Danh mục" }, { key: "level", label: "Cấp độ", type: "select", options: LEVEL },
        { key: "duration_minutes", label: "Thời lượng (phút)", type: "number" }, { key: "lessons_count", label: "Số bài học", type: "number" },
        { key: "instructor", label: "Giảng viên" }, { key: "status", label: "Trạng thái", type: "select", options: STATUS },
      ]}
      emptyValues={{ code: "", title: "", description: "", category: "", level: "beginner", duration_minutes: 0, instructor: "", students_count: 0, lessons_count: 0, status: "draft", cover_url: "" }}
      onCreate={(v) => m.create.mutateAsync(v)}
      onUpdate={(v) => m.update.mutateAsync(v)}
      onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, duration_minutes: Number(r.duration_minutes) || 0, lessons_count: Number(r.lessons_count) || 0, students_count: 0, level: r.level || "beginner", status: r.status || "draft", cover_url: "" })))}
      csvFilename="online_courses.csv"
    />
  );
}
