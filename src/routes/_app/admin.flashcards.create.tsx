import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export const Route = createFileRoute("/_app/admin/flashcards/create")({
  head: () => ({ meta: [{ title: "Tạo Flashcard — OnAir LMS" }] }),
  component: CreateFlashcard,
});

function CreateFlashcard() {
  const [cards, setCards] = useState([{ front: "", back: "" }, { front: "", back: "" }]);
  return (
    <PageContainer
      title="Tạo bộ Flashcard"
      breadcrumbs={[{ title: "Flashcard", path: "/admin/flashcards" }, { title: "Tạo mới" }]}
      actions={
        <>
          <Button asChild variant="outline" size="sm"><Link to="/admin/flashcards"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button>
          <Button size="sm"><Save className="h-4 w-4" />Lưu</Button>
        </>
      }
    >
      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin bộ thẻ</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Tên bộ *</Label><Input placeholder="VD: Từ vựng tiếng Anh thương mại" /></div>
            <div className="space-y-1.5"><Label>Lĩnh vực</Label><Input placeholder="Ngoại ngữ" /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Các thẻ</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setCards([...cards, { front: "", back: "" }])}>
            <Plus className="h-4 w-4" />Thêm thẻ
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {cards.map((c, i) => (
            <div key={i} className="flex items-start gap-3 rounded-md border p-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{i + 1}</span>
              <div className="grid flex-1 grid-cols-2 gap-3">
                <Textarea rows={2} defaultValue={c.front} placeholder="Mặt trước (câu hỏi)..." />
                <Textarea rows={2} defaultValue={c.back} placeholder="Mặt sau (đáp án)..." />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCards(cards.filter((_, idx) => idx !== i))}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
