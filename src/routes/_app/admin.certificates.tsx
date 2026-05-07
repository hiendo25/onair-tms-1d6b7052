import { createFileRoute } from "@tanstack/react-router";
import { useCertificates, useCertificateMutations, type DBCertificate } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";
import { certificateSchema, type CertificateForm } from "@/lib/admin-schemas";
import { STATUS_ACTIVE_INACTIVE, CODE_NOTE } from "@/lib/admin-options";
import type { FieldDef } from "@/components/admin/EntityFormDialog";

export const Route = createFileRoute("/_app/admin/certificates")({
  head: () => ({ meta: [{ title: "Chứng chỉ — OnAir TMS" }] }),
  component: Page,
});

const formFields: FieldDef<CertificateForm>[] = [
  { name: "title", label: "Tên chứng nhận", type: "text", required: true, placeholder: "VD: Chứng nhận hoàn thành" },
  { name: "code", label: "Mã chứng nhận", type: "text", required: true, note: CODE_NOTE },
  { name: "description", label: "Mô tả", type: "textarea", rows: 3 },
  { name: "valid_months", label: "Thời hạn hiệu lực (tháng)", type: "number", required: true, placeholder: "VD: 12" },
  { name: "status", label: "Trạng thái", type: "select", required: true, options: STATUS_ACTIVE_INACTIVE },
];
const empty: Partial<DBCertificate> = { code: "", title: "", description: "", template_url: "", valid_months: 12, issued_count: 0, status: "active" };

function Page() {
  const { data: rows = [], isLoading } = useCertificates();
  const m = useCertificateMutations();
  return (
    <SimpleEntityPage<DBCertificate>
      title="Quản lý chứng nhận" breadcrumbs={[{ title: "Công nhận" }, { title: "Chứng nhận" }]}
      rows={rows} isLoading={isLoading} searchKeys={["title", "code"]}
      filters={[{ key: "status", placeholder: "Trạng thái", options: STATUS_ACTIVE_INACTIVE, match: (r, v) => r.status === v }]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên" }, { key: "valid_months", label: "Hạn (tháng)" },
        { key: "issued_count", label: "Đã cấp" },
        { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[]}
      schema={certificateSchema}
      formFields={formFields}
      entityLabel="chứng nhận"
      emptyValues={empty}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, valid_months: Number(r.valid_months) || 12, issued_count: 0, template_url: "", status: r.status || "active" })))}
      csvFilename="certificates.csv"
    />
  );
}
