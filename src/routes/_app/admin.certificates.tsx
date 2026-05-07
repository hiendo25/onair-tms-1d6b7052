import { createFileRoute } from "@tanstack/react-router";
import { useCertificates, useCertificateMutations, type DBCertificate } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/certificates")({
  head: () => ({ meta: [{ title: "Chứng chỉ — OnAir TMS" }] }),
  component: Page,
});
const STATUS = [{ value: "draft", label: "Nháp" }, { value: "active", label: "Hoạt động" }, { value: "inactive", label: "Ngưng" }];

function Page() {
  const { data: rows = [], isLoading } = useCertificates();
  const m = useCertificateMutations();
  return (
    <SimpleEntityPage<DBCertificate>
      title="Quản lý chứng chỉ" breadcrumbs={[{ title: "Công nhận" }, { title: "Chứng chỉ" }]}
      rows={rows} isLoading={isLoading} searchKeys={["title", "code"]}
      filters={[{ key: "status", placeholder: "Trạng thái", options: STATUS, match: (r, v) => r.status === v }]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên" }, { key: "valid_months", label: "Hạn (tháng)" },
        { key: "issued_count", label: "Đã cấp" },
        { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[
        { key: "code", label: "Mã" }, { key: "title", label: "Tên" }, { key: "description", label: "Mô tả", type: "textarea" },
        { key: "valid_months", label: "Thời hạn (tháng)", type: "number" },
        { key: "status", label: "Trạng thái", type: "select", options: STATUS },
      ]}
      emptyValues={{ code: "", title: "", description: "", template_url: "", valid_months: 12, issued_count: 0, status: "active" }}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, valid_months: Number(r.valid_months) || 12, issued_count: 0, template_url: "", status: r.status || "active" })))}
      csvFilename="certificates.csv"
    />
  );
}
