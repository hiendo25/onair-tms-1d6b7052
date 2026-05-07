import { createFileRoute } from "@tanstack/react-router";
import { useOnlineCourses, useOnlineCourseMutations, type DBOnlineCourse } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";
import { courseSchema, type CourseForm } from "@/lib/admin-schemas";
import { COURSE_LEVEL, COURSE_STATUS, CODE_NOTE } from "@/lib/admin-options";
import type { FieldDef } from "@/components/admin/EntityFormDialog";

export const Route = createFileRoute("/_app/admin/online-course")({
  head: () => ({ meta: [{ title: "Khoá học online — OnAir TMS" }] }),
  component: OnlineCoursePage,
});

const formFields: FieldDef<CourseForm>[] = [
  { name: "title", label: "Tên môn học", type: "text", required: true, placeholder: "Tối đa 200 ký tự" },
  { name: "code", label: "Mã khoá học", type: "text", required: true, placeholder: "VD: ONB-01", note: CODE_NOTE },
  { name: "description", label: "Mô tả nội dung", type: "textarea", required: true, rows: 4, placeholder: "Mô tả mục tiêu và nội dung khoá học" },
  { name: "category", label: "Lĩnh vực", type: "text", required: true, placeholder: "VD: Kỹ năng mềm" },
  { name: "level", label: "Cấp độ", type: "select", required: true, options: COURSE_LEVEL },
  { name: "duration_minutes", label: "Thời lượng (phút)", type: "number" },
  { name: "instructor", label: "Giảng viên", type: "text" },
  { name: "status", label: "Trạng thái", type: "select", required: true, options: COURSE_STATUS },
];
const empty: Partial<DBOnlineCourse> = { code: "", title: "", description: "", category: "", level: "beginner", duration_minutes: 0, instructor: "", students_count: 0, lessons_count: 0, status: "draft", cover_url: "" };

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
        { key: "status", placeholder: "Trạng thái", options: COURSE_STATUS, match: (r, v) => r.status === v },
        { key: "level", placeholder: "Cấp độ", options: COURSE_LEVEL, match: (r, v) => r.level === v },
        { key: "category", placeholder: "Lĩnh vực", options: cats, match: (r, v) => r.category === v },
      ]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên khoá học" },
        { key: "category", label: "Lĩnh vực" },
        { key: "level", label: "Cấp độ" },
        { key: "instructor", label: "Giảng viên" },
        { key: "lessons_count", label: "Bài" },
        { key: "students_count", label: "Học viên" },
        { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[]}
      schema={courseSchema}
      formFields={formFields}
      entityLabel="khoá học"
      emptyValues={empty}
      onCreate={(v) => m.create.mutateAsync(v)}
      onUpdate={(v) => m.update.mutateAsync(v)}
      onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, duration_minutes: Number(r.duration_minutes) || 0, lessons_count: Number(r.lessons_count) || 0, students_count: 0, level: r.level || "beginner", status: r.status || "draft", cover_url: "" })))}
      csvFilename="online_courses.csv"
    />
  );
}
