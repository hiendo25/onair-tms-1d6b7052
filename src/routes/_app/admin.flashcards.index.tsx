import { createFileRoute } from "@tanstack/react-router";
import { useFlashcards, useFlashcardMutations, type DBFlashcard } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/flashcards/")({
  head: () => ({ meta: [{ title: "Flashcards — OnAir TMS" }] }),
  component: Page,
});
const STATUS = [{ value: "draft", label: "Nháp" }, { value: "active", label: "Hoạt động" }];

function Page() {
  const { data: rows = [], isLoading } = useFlashcards();
  const m = useFlashcardMutations();
  return (
    <SimpleEntityPage<DBFlashcard>
      title="Quản lý Flashcards" breadcrumbs={[{ title: "Đào tạo" }, { title: "Flashcards" }]}
      rows={rows} isLoading={isLoading} searchKeys={["title", "code", "category"]}
      filters={[{ key: "status", placeholder: "Trạng thái", options: STATUS, match: (r, v) => r.status === v }]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên" }, { key: "category", label: "Danh mục" },
        { key: "cards_count", label: "Thẻ" }, { key: "students_count", label: "HV" },
        { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[
        { key: "code", label: "Mã" }, { key: "title", label: "Tên" }, { key: "description", label: "Mô tả", type: "textarea" },
        { key: "category", label: "Danh mục" }, { key: "cards_count", label: "Số thẻ", type: "number" },
        { key: "status", label: "Trạng thái", type: "select", options: STATUS },
      ]}
      emptyValues={{ code: "", title: "", description: "", category: "", cards_count: 0, students_count: 0, status: "active" }}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, cards_count: Number(r.cards_count) || 0, students_count: 0, status: r.status || "active" })))}
      csvFilename="flashcards.csv"
    />
  );
}
