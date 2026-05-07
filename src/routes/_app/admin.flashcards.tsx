import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Layers, MoreHorizontal } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_FLASHCARDS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/flashcards")({
  head: () => ({ meta: [{ title: "Flashcard — OnAir LMS" }] }),
  component: () => (
    <PageContainer
      title="Flashcard"
      breadcrumbs={[{ title: "Flashcard" }]}
      actions={<Button asChild size="sm"><Link to="/admin/flashcards/create"><Plus className="h-4 w-4" />Tạo Flashcard</Link></Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {MOCK_FLASHCARDS.map(f => (
          <Card key={f.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
              <Layers className="h-10 w-10 text-indigo-600" />
              <span className="absolute right-3 top-3 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 backdrop-blur">
                {f.cards} thẻ
              </span>
            </div>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug line-clamp-2">{f.title}</h3>
                <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <Badge variant="secondary">{f.category}</Badge>
                <span className="text-muted-foreground">{f.createdAt}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  ),
});
