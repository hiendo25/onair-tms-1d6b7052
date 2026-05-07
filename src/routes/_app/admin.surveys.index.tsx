import { createFileRoute } from "@tanstack/react-router";
import { useSurveys, useSurveyMutations, type DBSurvey } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";
import { surveySchema, type SurveyForm } from "@/lib/admin-schemas";
import { SURVEY_TYPE, SURVEY_STATUS, CODE_NOTE } from "@/lib/admin-options";
import type { FieldDef } from "@/components/admin/EntityFormDialog";

export const Route = createFileRoute("/_app/admin/surveys/")({
  head: () => ({ meta: [{ title: "Khảo sát — OnAir TMS" }] }),
  component: Page,
});

const formFields: FieldDef<SurveyForm>[] = [
  { name: "title", label: "Tên khảo sát", type: "text", required: true },
  { name: "code", label: "Mã khảo sát", type: "text", required: true, note: CODE_NOTE },
  { name: "description", label: "Mô tả", type: "textarea", rows: 3 },
  { name: "type", label: "Loại khảo sát", type: "select", required: true, options: SURVEY_TYPE },
  { name: "anonymous", label: "Cho phép trả lời ẩn danh", type: "switch" },
  { name: "start_date", label: "Ngày bắt đầu", type: "date" },
  { name: "end_date", label: "Ngày kết thúc", type: "date" },
  { name: "target_count", label: "Số lượng mục tiêu", type: "number" },
  { name: "status", label: "Trạng thái", type: "select", required: true, options: SURVEY_STATUS },
];
const empty: Partial<DBSurvey> = { code: "", title: "", description: "", type: "general", anonymous: false, responses_count: 0, target_count: 0, start_date: "", end_date: "", status: "draft" };

function Page() {
  const { data: rows = [], isLoading } = useSurveys();
  const m = useSurveyMutations();
  return (
    <SimpleEntityPage<DBSurvey>
      title="Quản lý khảo sát" breadcrumbs={[{ title: "Khảo sát" }]}
      rows={rows} isLoading={isLoading} searchKeys={["title", "code"]}
      filters={[
        { key: "type", placeholder: "Loại", options: SURVEY_TYPE, match: (r, v) => r.type === v },
        { key: "status", placeholder: "Trạng thái", options: SURVEY_STATUS, match: (r, v) => r.status === v },
      ]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên" }, { key: "type", label: "Loại" },
        { key: "responses_count", label: "Phản hồi" }, { key: "target_count", label: "Mục tiêu" },
        { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[]}
      schema={surveySchema}
      formFields={formFields}
      entityLabel="khảo sát"
      emptyValues={empty}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, target_count: Number(r.target_count) || 0, responses_count: 0, anonymous: r.anonymous === "true" || r.anonymous === true, type: r.type || "general", status: r.status || "draft" })))}
      csvFilename="surveys.csv"
    />
  );
}
