import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/admin/flashcards/$id/edit")({
  head: () => ({ meta: [{ title: "Sửa Flashcard — OnAir TMS" }] }),
  component: EditFC,
});
function EditFC() {
  const { id } = Route.useParams();
  return (
    <PageContainer title="Chỉnh sửa Flashcard" breadcrumbs={[{ title: "Flashcard", path: "/admin/flashcards" }, { title: `#${id}` }, { title: "Sửa" }]}>
      <Card><CardHeader><CardTitle>Thông tin bộ thẻ</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div><Label>Tên bộ thẻ</Label><Input defaultValue="Từ vựng React"/></div>
          <div><Label>Mô tả</Label><Textarea rows={3}/></div>
          <div className="space-y-2">
            <Label>Thẻ</Label>
            {Array.from({length:3}).map((_,i)=>(
              <div key={i} className="grid grid-cols-2 gap-2"><Input placeholder="Mặt trước"/><Input placeholder="Mặt sau"/></div>
            ))}
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline">Hủy</Button><Button>Lưu</Button></div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
