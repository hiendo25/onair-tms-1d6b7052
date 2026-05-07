import { createFileRoute } from "@tanstack/react-router";
import { Layers, Play } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFlashcards } from "@/lib/data-hooks";

export const Route = createFileRoute("/_app/my-flashcards")({
  head: () => ({ meta: [{ title: "Flashcard — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { data: rows = [], isLoading } = useFlashcards();
  return (
    <PageContainer title="Flashcard của tôi" breadcrumbs={[{ title: "Thư viện" }, { title: "Flashcard" }]}>
      {isLoading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Đang tải...</div>
      ) : rows.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Layers className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Chưa có bộ flashcard nào</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((f) => (
            <Card key={f.id} className="hover:shadow-md transition">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                    <Layers className="h-5 w-5" />
                  </div>
                  <Badge variant="outline">{f.cards_count} thẻ</Badge>
                </div>
                <div>
                  <div className="font-medium">{f.title}</div>
                  <div className="text-xs text-muted-foreground">{f.category || "—"}</div>
                </div>
                {f.description && <p className="text-xs text-muted-foreground line-clamp-2">{f.description}</p>}
                <div className="flex items-center justify-end">
                  <Button size="sm" variant="ghost" className="h-7">
                    <Play className="h-3.5 w-3.5 mr-1" /> Học
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
