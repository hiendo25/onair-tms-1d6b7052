import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

export const Route = createFileRoute("/_app/admin/flashcards/$id")({
  head: () => ({ meta: [{ title: "Chi tiết Flashcard — OnAir LMS" }] }),
  component: FCDetail,
});
function FCDetail() {
  const { id } = Route.useParams();
  return (
    <PageContainer title={`Bộ Flashcard #${id}`} breadcrumbs={[{ title: "Flashcard", path: "/admin/flashcards" }, { title: `#${id}` }]}
      actions={<Button size="sm" asChild><Link to="/admin/flashcards/$id/edit" params={{id}}><Edit className="h-4 w-4"/>Sửa</Link></Button>}>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({length:6}).map((_,i)=>(
          <Card key={i}><CardContent className="p-6 space-y-2">
            <div className="text-xs text-muted-foreground">Mặt trước</div>
            <div className="font-medium">Câu hỏi {i+1}?</div>
            <div className="text-xs text-muted-foreground mt-3">Mặt sau</div>
            <div className="text-sm">Đáp án {i+1}</div>
          </CardContent></Card>
        ))}
      </div>
    </PageContainer>
  );
}
