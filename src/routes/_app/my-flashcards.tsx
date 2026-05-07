import { createFileRoute } from "@tanstack/react-router";
import { Layers, Play } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MOCK = [
  { id: "1", title: "Từ vựng pha chế", category: "Barista", cards: 24, progress: 60 },
  { id: "2", title: "Quy trình phục vụ khách", category: "Service", cards: 18, progress: 100 },
  { id: "3", title: "Sản phẩm Highlands 2026", category: "Sản phẩm", cards: 32, progress: 25 },
  { id: "4", title: "ATVSTP căn bản", category: "An toàn", cards: 15, progress: 0 },
];

export const Route = createFileRoute("/_app/my-flashcards")({
  head: () => ({ meta: [{ title: "Flashcard — OnAir TMS" }] }),
  component: () => (
    <PageContainer title="Flashcard của tôi" breadcrumbs={[{ title: "Thư viện" }, { title: "Flashcard" }]}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK.map((f) => (
          <Card key={f.id} className="hover:shadow-md transition">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <Layers className="h-5 w-5" />
                </div>
                <Badge variant="outline">{f.cards} thẻ</Badge>
              </div>
              <div>
                <div className="font-medium">{f.title}</div>
                <div className="text-xs text-muted-foreground">{f.category}</div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${f.progress}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tiến độ {f.progress}%</span>
                <Button size="sm" variant="ghost" className="h-7">
                  <Play className="h-3.5 w-3.5 mr-1" /> Học
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  ),
});
